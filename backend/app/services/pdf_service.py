import os
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from typing import Dict, Any

class PDFReportService:
    def generate_stock_report(self, stock_details: Dict[str, Any], prediction_data: Dict[str, Any]) -> BytesIO:
        """
        Generate a gorgeous, high-fidelity PDF report of stock performance and AI predictions
        using ReportLab, returning a BytesIO stream.
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=letter, 
            rightMargin=40, 
            leftMargin=40, 
            topMargin=45, 
            bottomMargin=45
        )
        
        story = []
        styles = getSampleStyleSheet()
        
        # Define Custom Color Palette (Modern Finance Theme)
        primary_color = colors.HexColor("#0f172a")    # Slate 900
        secondary_color = colors.HexColor("#0284c7")  # Sky 600
        accent_color = colors.HexColor("#3b82f6")     # Blue 500
        text_dark = colors.HexColor("#334155")        # Slate 700
        bg_light = colors.HexColor("#f8fafc")         # Slate 50
        border_color = colors.HexColor("#e2e8f0")     # Slate 200
        
        # Define Recommendations colors
        rec_color_map = {
            "BUY": colors.HexColor("#16a34a"),   # Green 600
            "SELL": colors.HexColor("#dc2626"),  # Red 600
            "HOLD": colors.HexColor("#ca8a04")   # Yellow 600
        }
        rec_bg_map = {
            "BUY": colors.HexColor("#f0fdf4"),   # Green 50
            "SELL": colors.HexColor("#fef2f2"),  # Red 50
            "HOLD": colors.HexColor("#fefcbf")   # Yellow 50
        }
        
        rec = prediction_data.get("recommendation", "HOLD")
        rec_color = rec_color_map.get(rec, colors.HexColor("#3b82f6"))
        rec_bg = rec_bg_map.get(rec, bg_light)
        
        # --- Custom Paragraph Styles ---
        title_style = ParagraphStyle(
            name='DocTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=24,
            leading=28,
            textColor=primary_color,
            spaceAfter=4
        )
        
        subtitle_style = ParagraphStyle(
            name='DocSubTitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=12,
            leading=16,
            textColor=secondary_color,
            spaceAfter=20
        )
        
        h1_style = ParagraphStyle(
            name='SectionH1',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=16,
            leading=20,
            textColor=primary_color,
            spaceBefore=14,
            spaceAfter=10,
            keepWithNext=True
        )
        
        body_style = ParagraphStyle(
            name='ReportBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=text_dark
        )
        
        bold_body_style = ParagraphStyle(
            name='ReportBodyBold',
            parent=body_style,
            fontName='Helvetica-Bold'
        )
        
        callout_title_style = ParagraphStyle(
            name='CalloutTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=rec_color
        )
        
        callout_body_style = ParagraphStyle(
            name='CalloutBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=text_dark
        )
        
        table_cell_style = ParagraphStyle(
            name='TableCell',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=text_dark
        )
        
        table_header_style = ParagraphStyle(
            name='TableHeader',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=12,
            textColor=colors.white
        )

        # --- Document Content ---
        
        # Title Header
        story.append(Paragraph(f"{stock_details['company_name']} ({stock_details['ticker']})", title_style))
        story.append(Paragraph(
            f"AI-Generated Technical Analysis and Forecast Report | Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}", 
            subtitle_style
        ))
        
        # Section 1: Executive Callout (Recommendation)
        rec_title = f"AI Algorithmic Verdict: {rec} (Confidence: {prediction_data['confidence_score']}%)"
        rec_text = prediction_data.get("recommendation_reason", "")
        
        # Create recommendation callout box using a table
        callout_data = [
            [Paragraph(rec_title, callout_title_style)],
            [Paragraph(rec_text, callout_body_style)]
        ]
        
        callout_table = Table(callout_data, colWidths=[530])
        callout_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), rec_bg),
            ('TOPPADDING', (0,0), (-1,-1), 12),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
            ('LEFTPADDING', (0,0), (-1,-1), 16),
            ('RIGHTPADDING', (0,0), (-1,-1), 16),
            ('BOX', (0,0), (-1,-1), 1.5, rec_color),
        ]))
        
        story.append(callout_table)
        story.append(Spacer(1, 15))
        
        # Section 2: Market Performance Highlights
        story.append(Paragraph("1. Current Market Highlights", h1_style))
        
        # Table of Highlights
        highlights_data = [
            [
                Paragraph("Metric", table_header_style), 
                Paragraph("Value", table_header_style),
                Paragraph("Metric", table_header_style),
                Paragraph("Value", table_header_style)
            ],
            [
                Paragraph("Current Share Price", table_cell_style),
                Paragraph(f"${stock_details['current_price']:.2f}", bold_body_style),
                Paragraph("Market Capitalization", table_cell_style),
                Paragraph(f"${stock_details['market_cap']:,.0f}", table_cell_style)
            ],
            [
                Paragraph("Today's Price Change", table_cell_style),
                Paragraph(f"{stock_details['change']:+.2f} ({stock_details['change_percent']:+.2f}%)", bold_body_style),
                Paragraph("50-Day Moving Average", table_cell_style),
                Paragraph(f"${prediction_data['moving_average_50']:.2f}", table_cell_style)
            ],
            [
                Paragraph("P/E Ratio (Trailing)", table_cell_style),
                Paragraph(f"{stock_details['pe_ratio']:.2f}" if stock_details['pe_ratio'] else "N/A", table_cell_style),
                Paragraph("200-Day Moving Average", table_cell_style),
                Paragraph(f"${prediction_data['moving_average_200']:.2f}", table_cell_style)
            ],
            [
                Paragraph("Dividend Yield", table_cell_style),
                Paragraph(f"{stock_details['dividend_yield']:.2f}%" if stock_details['dividend_yield'] else "N/A", table_cell_style),
                Paragraph("Overall News Sentiment", table_cell_style),
                Paragraph(f"{stock_details['sentiment_summary']['verdict']} ({stock_details['sentiment_summary']['sentiment_score']:+.2f})", bold_body_style)
            ]
        ]
        
        highlights_table = Table(highlights_data, colWidths=[140, 125, 140, 125])
        highlights_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), primary_color),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('GRID', (0,0), (-1,-1), 0.5, border_color),
            ('BACKGROUND', (0,1), (-1,-1), bg_light),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        
        story.append(highlights_table)
        story.append(Spacer(1, 15))
        
        # Section 3: Model Evaluation Scorecard
        story.append(Paragraph("2. AI Model Evaluation Scorecard", h1_style))
        story.append(Paragraph(
            "The time-series AI forecasting core fits historical sequences to optimize parameters. "
            "Model parameters are cross-validated in-sample to ensure stability. Below are the key fitting metrics:",
            body_style
        ))
        story.append(Spacer(1, 6))
        
        metrics_data = [
            [
                Paragraph("Evaluation Metric", table_header_style),
                Paragraph("Formula / Description", table_header_style),
                Paragraph("Calculated Fit Value", table_header_style)
            ],
            [
                Paragraph("Coefficient of Determination (R²)", table_cell_style),
                Paragraph("Proportion of closing price variance explained by LSTM equations.", table_cell_style),
                Paragraph(f"{prediction_data['r2_score']:.4f}", bold_body_style)
            ],
            [
                Paragraph("Root Mean Squared Error (RMSE)", table_cell_style),
                Paragraph("Standard deviation of residuals, penalizing outlier prediction errors.", table_cell_style),
                Paragraph(f"{prediction_data['rmse']:.4f}", table_cell_style)
            ],
            [
                Paragraph("Mean Absolute Error (MAE)", table_cell_style),
                Paragraph("Average absolute difference between actual and model-fit prices.", table_cell_style),
                Paragraph(f"{prediction_data['mae']:.4f}", table_cell_style)
            ]
        ]
        
        metrics_table = Table(metrics_data, colWidths=[160, 260, 110])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), primary_color),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('GRID', (0,0), (-1,-1), 0.5, border_color),
            ('BACKGROUND', (0,1), (-1,-1), bg_light),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        
        story.append(metrics_table)
        story.append(Spacer(1, 15))
        
        # Section 4: Future Price Projections
        story.append(Paragraph("3. Future Price Projections Ledger (AI LSTM)", h1_style))
        
        # List of future predicted prices
        pred_list = prediction_data.get("predicted_prices", [])
        
        # Split predicted list into two columns to fit nicely on the page
        half_len = (len(pred_list) + 1) // 2
        col1_list = pred_list[:half_len]
        col2_list = pred_list[half_len:]
        
        projection_headers = [
            Paragraph("Forecast Date", table_header_style),
            Paragraph("AI Predicted Price", table_header_style),
            Paragraph("Forecast Date", table_header_style),
            Paragraph("AI Predicted Price", table_header_style)
        ]
        
        projection_rows = [projection_headers]
        
        for i in range(half_len):
            col1_item = col1_list[i]
            col2_item = col2_list[i] if i < len(col2_list) else None
            
            row = [
                Paragraph(col1_item["date"], table_cell_style),
                Paragraph(f"${col1_item['price']:.2f}", bold_body_style),
                Paragraph(col2_item["date"] if col2_item else "-", table_cell_style),
                Paragraph(f"${col2_item['price']:.2f}" if col2_item else "-", bold_body_style if col2_item else table_cell_style)
            ]
            projection_rows.append(row)
            
        projection_table = Table(projection_rows, colWidths=[140, 125, 140, 125])
        projection_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), secondary_color),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('GRID', (0,0), (-1,-1), 0.5, border_color),
            ('BACKGROUND', (0,1), (-1,-1), bg_light),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        
        story.append(projection_table)
        story.append(Spacer(1, 20))
        
        # Footer Note
        disclaimer_style = ParagraphStyle(
            name='Disclaimer',
            parent=body_style,
            fontName='Helvetica-Oblique',
            fontSize=7,
            leading=10,
            textColor=colors.HexColor("#94a3b8"),
            alignment=1  # Centered
        )
        
        story.append(Paragraph(
            "Disclaimer: AI stock predictions are based on mathematical models analyzing historical sequences. "
            "They represent probabilistic forecasts and not financial trading advice. Invest responsibly.",
            disclaimer_style
        ))
        
        # Build Document
        doc.build(story)
        buffer.seek(0)
        return buffer

pdf_report_service = PDFReportService()
