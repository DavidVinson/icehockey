# CSV Heat Map Visualizer

A modern, interactive web application that creates beautiful heat map visualizations from CSV data. Built with vanilla JavaScript, HTML5, and CSS3, featuring a responsive design and smooth user experience.

## Features

- **Drag & Drop Upload**: Easy file upload with drag-and-drop functionality
- **Interactive Heat Maps**: Dynamic visualizations using Chart.js
- **Multiple Color Schemes**: Choose from 6 different color palettes (Viridis, Plasma, Inferno, Magma, Cool-Warm, Red-Yellow-Blue)
- **Data Preview**: View your CSV data before generating the heat map
- **Column Selection**: Choose which columns to use for X-axis, Y-axis, and values
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Download Functionality**: Save your heat map as a PNG image
- **Real-time Updates**: Instant visualization updates when changing parameters

## How to Use

1. **Open the Application**: Simply open `index.html` in your web browser
2. **Upload CSV File**: 
   - Drag and drop your CSV file onto the upload area, or
   - Click "Choose File" to browse and select your CSV file
3. **Configure Visualization**:
   - Select which column to use for the X-axis
   - Select which column to use for the Y-axis  
   - Select which column contains the values for the heat map
   - Choose your preferred color scheme
4. **Generate Heat Map**: Click "Generate Heat Map" to create your visualization
5. **Download**: Use the "Download Heat Map" button to save your visualization

## CSV Format Requirements

Your CSV file should have:
- A header row with column names
- At least 3 columns (for X-axis, Y-axis, and values)
- Numeric values in the value column
- Consistent data structure

### Example CSV Format:
```csv
City,Month,Temperature
New York,January,32
New York,February,35
Los Angeles,January,68
Los Angeles,February,70
```

## Sample Data

A sample CSV file (`sample_data.csv`) is included with temperature data for different cities across months. You can use this to test the application.

## Technical Details

### Technologies Used
- **HTML5**: Semantic markup and modern structure
- **CSS3**: Responsive design with CSS Grid and Flexbox
- **Vanilla JavaScript**: No frameworks, pure JavaScript for performance
- **Chart.js**: Professional charting library for heat map generation
- **File API**: HTML5 File API for client-side file processing

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### File Structure
```
ice/
├── index.html          # Main application file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
├── sample_data.csv     # Example data file
└── README.md           # This file
```

## Customization

### Adding New Color Schemes
You can add new color schemes by modifying the `colorSchemes` object in `script.js`:

```javascript
const colorSchemes = {
    // ... existing schemes
    myScheme: ['#color1', '#color2', '#color3', '#color4']
};
```

### Styling
The application uses CSS custom properties and modern CSS features. You can customize the appearance by modifying `styles.css`.

## Performance Considerations

- **Client-side Processing**: All data processing happens in the browser for privacy and speed
- **Efficient Rendering**: Chart.js provides optimized rendering for large datasets
- **Memory Management**: Proper cleanup of chart instances to prevent memory leaks

## Troubleshooting

### Common Issues

1. **File Not Loading**: Ensure your CSV file has a `.csv` extension
2. **No Data Displayed**: Check that your CSV has a header row and at least one data row
3. **Invalid Values**: Make sure your value column contains numeric data
4. **Chart Not Rendering**: Try refreshing the page and uploading the file again

### Data Validation
The application automatically validates:
- File format (must be CSV)
- Data structure (must have headers)
- Numeric values in the value column
- Required column selections

## Future Enhancements

Potential features for future versions:
- Support for multiple file formats (Excel, JSON)
- Advanced filtering and data manipulation
- Export to different formats (PDF, SVG)
- Custom color mapping
- Animated transitions
- Data clustering and analysis tools

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Submitting pull requests
- Improving documentation

---

**Enjoy creating beautiful heat map visualizations!** 🌡️📊 