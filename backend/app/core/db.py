import os
import json
import logging
import asyncio
from typing import Dict, List, Any, Optional
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from backend.app.core.config import settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("db_adapter")

class DatabaseAdapter:
    def __init__(self):
        self.mongodb_client: Optional[MongoClient] = None
        self.db = None
        self.is_mongodb: bool = False
        self.lock = asyncio.Lock()
        
        # Local JSON database structure
        self.mock_db_path = settings.MOCK_DB_FILE
        self._init_mock_db()

    def _init_mock_db(self):
        """Initialize local JSON mock database file if it does not exist."""
        if not os.path.exists(self.mock_db_path):
            initial_data = {
                "users": [],
                "portfolio": [],
                "predictions": [],
                "watchlist": [],
                "transactions": []
            }
            with open(self.mock_db_path, 'w') as f:
                json.dump(initial_data, f, indent=4)
            logger.info(f"Initialized mock database at {self.mock_db_path}")

    async def connect(self):
        """Connect to MongoDB or fallback to Mock JSON Database."""
        try:
            logger.info(f"Attempting to connect to MongoDB at {settings.MONGODB_URL}...")
            # Set a low timeout so we don't block the app startup for too long if MongoDB is offline
            self.mongodb_client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
            # Trigger a connection attempt
            self.mongodb_client.admin.command('ping')
            
            self.db = self.mongodb_client[settings.DATABASE_NAME]
            self.is_mongodb = True
            logger.info("Successfully connected to MongoDB! Operating in MongoDB mode.")
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
            self.is_mongodb = False
            logger.warning(
                f"Could not connect to MongoDB: {str(e)}. "
                f"Falling back to Local JSON database mode ({self.mock_db_path})."
            )

    async def disconnect(self):
        if self.is_mongodb and self.mongodb_client:
            self.mongodb_client.close()
            logger.info("Closed MongoDB connection.")

    # --- Standard CRUD Interface mapping to MongoDB or JSON ---

    def _read_mock_db(self) -> Dict[str, List[Any]]:
        try:
            with open(self.mock_db_path, 'r') as f:
                return json.load(f)
        except Exception:
            return {"users": [], "portfolio": [], "predictions": [], "watchlist": [], "transactions": []}

    def _write_mock_db(self, data: Dict[str, List[Any]]):
        try:
            with open(self.mock_db_path, 'w') as f:
                json.dump(data, f, indent=4)
        except Exception as e:
            logger.error(f"Failed to write to mock database: {str(e)}")

    async def insert_one(self, collection_name: str, document: Dict[str, Any]) -> Dict[str, Any]:
        """Insert a document into the specified collection."""
        if self.is_mongodb:
            # MongoDB mode
            coll = self.db[collection_name]
            result = coll.insert_one(document)
            # Convert ObjectId to string for compatibility
            doc = document.copy()
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
            return doc
        else:
            # JSON File fallback mode
            async with self.lock:
                db_data = self._read_mock_db()
                if collection_name not in db_data:
                    db_data[collection_name] = []
                
                # Generate unique ID if not present
                import uuid
                if "id" not in document and "_id" not in document:
                    document["_id"] = str(uuid.uuid4())
                elif "_id" in document and "id" not in document:
                    document["id"] = document["_id"]
                elif "id" in document and "_id" not in document:
                    document["_id"] = document["id"]

                db_data[collection_name].append(document)
                self._write_mock_db(db_data)
                return document

    async def find_one(self, collection_name: str, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Find a single document matching the query."""
        if self.is_mongodb:
            coll = self.db[collection_name]
            # Convert _id query if necessary
            doc = coll.find_one(query)
            if doc:
                doc["_id"] = str(doc["_id"])
            return doc
        else:
            async with self.lock:
                db_data = self._read_mock_db()
                coll_list = db_data.get(collection_name, [])
                for item in coll_list:
                    match = True
                    for key, val in query.items():
                        if item.get(key) != val:
                            match = False
                            break
                    if match:
                        return item
                return None

    async def find_many(self, collection_name: str, query: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Find multiple documents matching the query."""
        if query is None:
            query = {}
            
        if self.is_mongodb:
            coll = self.db[collection_name]
            cursor = coll.find(query)
            results = []
            for doc in cursor:
                doc["_id"] = str(doc["_id"])
                results.append(doc)
            return results
        else:
            async with self.lock:
                db_data = self._read_mock_db()
                coll_list = db_data.get(collection_name, [])
                if not query:
                    return coll_list
                
                results = []
                for item in coll_list:
                    match = True
                    for key, val in query.items():
                        if item.get(key) != val:
                            match = False
                            break
                    if match:
                        results.append(item)
                return results

    async def update_one(self, collection_name: str, query: Dict[str, Any], update_data: Dict[str, Any]) -> bool:
        """Update a single document matching the query."""
        if self.is_mongodb:
            coll = self.db[collection_name]
            result = coll.update_one(query, {"$set": update_data})
            return result.modified_count > 0
        else:
            async with self.lock:
                db_data = self._read_mock_db()
                coll_list = db_data.get(collection_name, [])
                updated = False
                for item in coll_list:
                    match = True
                    for key, val in query.items():
                        if item.get(key) != val:
                            match = False
                            break
                    if match:
                        # Perform update
                        for k, v in update_data.items():
                            item[k] = v
                        updated = True
                        break
                
                if updated:
                    self._write_mock_db(db_data)
                return updated

    async def delete_one(self, collection_name: str, query: Dict[str, Any]) -> bool:
        """Delete a single document matching the query."""
        if self.is_mongodb:
            coll = self.db[collection_name]
            result = coll.delete_one(query)
            return result.deleted_count > 0
        else:
            async with self.lock:
                db_data = self._read_mock_db()
                coll_list = db_data.get(collection_name, [])
                index_to_delete = -1
                for idx, item in enumerate(coll_list):
                    match = True
                    for key, val in query.items():
                        if item.get(key) != val:
                            match = False
                            break
                    if match:
                        index_to_delete = idx
                        break
                
                if index_to_delete != -1:
                    coll_list.pop(index_to_delete)
                    db_data[collection_name] = coll_list
                    self._write_mock_db(db_data)
                    return True
                return False

# Export a single global adapter instance
db_adapter = DatabaseAdapter()
