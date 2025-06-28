# Hockey Rink Ice Depth Heat Map Visualizer

An interactive web application for visualizing ice depth measurements across a 200' x 85' hockey rink using Plotly.js. Upload CSV or Excel files and generate dynamic heat maps that show ice depth variations relative to the sheet average.

## Features

- **Interactive Heat Maps**: Dynamic visualizations using Plotly.js
- **Multiple File Formats**: Support for CSV, XLSX, and XLS files
- **Drag & Drop Upload**: Easy file upload with visual feedback
- **Column Selection**: Choose which columns represent x-axis, y-axis, and measurements
- **Color-Coded Visualization**: 
  - 🔴 Red: Above sheet average (> +0.25")
  - ⚪ White: Neutral (±0.25" from average)
  - 🔵 Blue: Below sheet average (< -0.25")
- **Real-time Processing**: Instant visualization with loading indicators
- **Data Preview**: Preview your data before generating the heat map
- **Responsive Design**: Works on desktop and mobile devices
- **Download Capability**: Save your heat map as a PNG image
- **Debug Information**: Detailed logging for troubleshooting
- **Highest/Lowest Points**: Display of extreme measurement locations

## Technology Stack

- **HTML5**: Modern semantic markup
- **CSS3**: Responsive design with animations
- **JavaScript (ES6+)**: Modern JavaScript with async/await
- **Plotly.js**: Professional charting library for heat map generation
- **SheetJS**: Excel file parsing library
- **Python HTTP Server**: Simple local development server

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x (for local development server)

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Start the development server:

```bash
npm run dev
# or
python3 -m http.server 8000
```

4. Open your browser and go to `http://localhost:8000`

## Supported File Formats

The application supports the following file formats:

### CSV Files (.csv)
- **Encoding**: UTF-8 recommended
- **Delimiter**: Comma (,)
- **Headers**: First row must contain column names
- **Data**: Subsequent rows contain measurement data

### Excel Files (.xlsx, .xls)
- **Format**: Microsoft Excel workbooks
- **Worksheet**: Uses the first worksheet in the file
- **Headers**: First row must contain column names
- **Data**: Subsequent rows contain measurement data

## Data Structure Requirements

### Required Columns
Your data file must contain at least three columns:

1. **X-axis Column**: Positions along the rink length (0-200 feet)
2. **Y-axis Column**: Positions along the rink width (0-85 feet)  
3. **Measurement Column**: Ice depth values in inches

### Column Naming
- Column names can be any text (e.g., "x-axis", "X", "Length", "Position X")
- The application will let you select which column represents each axis
- Default column names expected: "x-axis", "y-axis", "measurement"

### Data Format Requirements

#### X and Y Coordinates
- **Type**: Numeric values (integers or decimals)
- **Range**: 
  - X-axis: 0 to 200 feet (rink length)
  - Y-axis: 0 to 85 feet (rink width)
- **Units**: Feet
- **Precision**: Any decimal precision accepted

#### Ice Depth Measurements
- **Type**: Numeric values (integers or decimals)
- **Range**: Typically 0.5 to 2.5 inches (but any positive value accepted)
- **Units**: Inches
- **Precision**: Any decimal precision accepted

### Example Data Structure

#### CSV Format Example:
```csv
x-axis,y-axis,measurement
10,20,1.25
15,25,1.30
20,30,1.28
25,35,1.22
30,40,1.35
35,45,1.18
40,50,1.42
45,55,1.15
50,60,1.38
55,65,1.20
60,70,1.32
```

#### Excel Format Example:
| x-axis | y-axis | measurement |
|--------|--------|-------------|
| 10     | 20     | 1.25        |
| 15     | 25     | 1.30        |
| 20     | 30     | 1.28        |
| 25     | 35     | 1.22        |
| 30     | 40     | 1.35        |

### Data Quality Guidelines

#### Best Practices
- **Complete Data**: Ensure all required columns are present
- **Valid Numbers**: Use numeric values only (no text in measurement columns)
- **Consistent Units**: Use feet for coordinates, inches for measurements
- **Reasonable Range**: Coordinates should be within rink dimensions
- **No Empty Rows**: Remove any completely empty rows
- **Header Row**: Always include a header row with column names

#### Common Issues to Avoid
- **Mixed Data Types**: Don't mix text and numbers in the same column
- **Missing Values**: Avoid empty cells in required columns
- **Wrong Units**: Don't mix feet/inches or use metric units
- **Out of Range**: Coordinates outside 0-200' x 0-85' will be filtered out
- **Extra Columns**: Unused columns are fine but may cause confusion

## Usage Instructions

### Step 1: Prepare Your Data
1. **Format Your Data**: Ensure your file follows the data structure requirements above
2. **Save in Supported Format**: Save as CSV, XLSX, or XLS file
3. **Check Data Quality**: Verify all measurements are numeric and within expected ranges

### Step 2: Upload Your File
1. **Drag & Drop**: Simply drag your file onto the upload area
2. **Click to Browse**: Click the upload area to open file selection dialog
3. **File Validation**: The app will automatically validate your file format
4. **Processing**: Wait for the file to be processed (loading indicator will show)

### Step 3: Configure Column Mapping
1. **Review Data Preview**: Check that your data loaded correctly
2. **Select X-Axis Column**: Choose the column representing rink length (0-200 feet)
3. **Select Y-Axis Column**: Choose the column representing rink width (0-85 feet)
4. **Select Measurement Column**: Choose the column with ice depth values (inches)

### Step 4: Generate the Heat Map
1. **Click Generate**: Press "Generate Ice Depth Heat Map" button
2. **Wait for Processing**: The app will calculate averages and create the visualization
3. **Review Results**: Check the heat map and legend for data insights

### Step 5: Interact and Analyze
1. **Hover for Details**: Move your mouse over points to see exact values
2. **Review Legend**: Check the color-coded legend and extreme points
3. **Analyze Patterns**: Look for areas that need attention (red/blue areas)
4. **Download Image**: Save the heat map as a PNG file if needed

## Understanding the Visualization

### Color Coding System
- **🔴 Red Areas**: Ice depth above sheet average by more than 0.25 inches
  - Indicates areas that may need to be shaved down
  - Higher values = more red intensity
- **⚪ White Areas**: Ice depth within ±0.25 inches of sheet average
  - Indicates properly maintained ice
  - Optimal playing conditions
- **🔵 Blue Areas**: Ice depth below sheet average by more than 0.25 inches
  - Indicates areas that may need additional ice
  - Lower values = more blue intensity

### Legend Information
The legend displays:
- **Color Scale**: Visual representation of the color coding system
- **Sheet Average**: Calculated average ice depth for the entire rink
- **Highest Point**: Location and value of the deepest ice measurement
- **Lowest Point**: Location and value of the thinnest ice measurement
- **Data Points**: Total number of measurements processed

### Grid System
- **5-Foot Grid**: Measurements are interpolated onto a 5-foot grid
- **Smooth Visualization**: Inverse distance weighting creates smooth color transitions
- **Accurate Positioning**: Each point represents actual measurement locations

## Troubleshooting

### Common Issues and Solutions

#### File Won't Upload
- **Check Format**: Ensure file is CSV, XLSX, or XLS format
- **Check Size**: Very large files (>10MB) may cause issues
- **Check Browser**: Try a different browser or clear cache

#### Data Not Displaying
- **Check Column Selection**: Ensure correct columns are selected for each axis
- **Check Data Format**: Verify all values are numeric
- **Check Range**: Ensure coordinates are within 0-200' x 0-85'
- **Check Debug Info**: Look at debug section for error details

#### Heat Map Looks Wrong
- **Check Units**: Ensure coordinates are in feet, measurements in inches
- **Check Column Mapping**: Verify x/y/measurement columns are correctly selected
- **Check Data Quality**: Look for outliers or invalid values
- **Try Sample Data**: Test with a simple dataset first

#### Performance Issues
- **Reduce Data Size**: Try with fewer measurement points
- **Close Other Tabs**: Free up browser memory
- **Update Browser**: Ensure you're using a recent browser version

### Debug Information
The debug section shows:
- **File Status**: Whether file loaded successfully
- **Data Points**: Number of measurements processed
- **Sheet Average**: Calculated average ice depth
- **Chart Status**: Whether visualization was created
- **Technical Details**: File type, processing status, etc.

## Advanced Features

### Data Processing
- **Automatic Filtering**: Invalid or out-of-range data is automatically filtered
- **Average Calculation**: Sheet average computed from all valid measurements
- **Interpolation**: Missing areas filled using inverse distance weighting
- **Real-time Updates**: Changes to column selection update visualization instantly

### Export Options
- **PNG Download**: High-quality image export
- **Interactive Chart**: Full Plotly.js interactive features
- **Data Validation**: Automatic data quality checks

### Responsive Design
- **Mobile Friendly**: Works on tablets and phones
- **Touch Support**: Touch gestures for mobile interaction
- **Adaptive Layout**: Adjusts to different screen sizes

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues or questions:
1. Check the debug information in the app
2. Review the browser console for error messages
3. Ensure your file format and data structure are correct
4. Try with a smaller dataset first
5. Check the troubleshooting section above 