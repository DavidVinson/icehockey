// Global variables
let csvData = null;
let heatMapChart = null;
let sheetAverage = 0;
let currentData = null;
let heatMapPoints = []; // Make this global so tooltip callbacks can access it
let csvFileName = null; // Store the CSV file name

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, checking Plotly availability...');
    console.log('Plotly available:', typeof Plotly !== 'undefined');
    if (typeof Plotly !== 'undefined') {
        console.log('Plotly version:', Plotly.version);
    } else {
        console.error('Plotly is not loaded!');
    }
    
    initializeEventListeners();
    // Show file indicator with ready state
    showFileIndicator('No file selected', 'Please upload a CSV file to begin', 'ready');
});

function showFileIndicator(fileName, stats, status = 'active') {
    const fileIndicator = document.getElementById('fileIndicator');
    const currentFileName = document.getElementById('currentFileName');
    const fileStats = document.getElementById('fileStats');
    const fileStatus = document.getElementById('fileStatus');
    
    currentFileName.textContent = fileName;
    fileStats.textContent = stats;
    fileStatus.textContent = status;
    fileStatus.className = `status-badge ${status}`;
    
    fileIndicator.style.display = 'block';
    fileIndicator.classList.add('fade-in');
}

function updateFileStatus(status) {
    const fileStatus = document.getElementById('fileStatus');
    if (fileStatus) {
        fileStatus.textContent = status;
        fileStatus.className = `status-badge ${status}`;
    }
}

function showLoading(message = 'Processing data...') {
    const loadingSection = document.getElementById('loadingSection');
    const loadingMessage = document.getElementById('loadingMessage');
    
    loadingMessage.textContent = message;
    loadingSection.style.display = 'flex';
    loadingSection.classList.add('fade-in');
    
    // Update file status to loading
    updateFileStatus('loading');
}

function hideLoading() {
    const loadingSection = document.getElementById('loadingSection');
    
    loadingSection.classList.add('fade-out');
    setTimeout(() => {
        loadingSection.style.display = 'none';
        loadingSection.classList.remove('fade-out');
    }, 300);
    
    // Update file status back to active
    updateFileStatus('active');
}

function updateLoadingMessage(message) {
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.textContent = message;
}

function initializeEventListeners() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const generateBtn = document.getElementById('generateBtn');

    // File upload events
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File selection event
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // Generate heat map event
    generateBtn.addEventListener('click', generateHeatMap);
}

function calculateSheetAverage() {
    if (!csvData || !csvData.data) return;
    
    const measurements = csvData.data.map(row => parseFloat(row.measurement)).filter(val => !isNaN(val));
    sheetAverage = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    
    console.log('Sheet average depth:', sheetAverage.toFixed(2), 'inches');
}

function handleDragOver(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    
    if (file) {
        processFile(file);
        // Clear the file input after processing to allow the same file to be selected again
        e.target.value = '';
    }
}

function processFile(file) {
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const supportedFormats = ['csv', 'xlsx', 'xls'];
    
    if (!supportedFormats.includes(fileExtension)) {
        alert('Please select a CSV or Excel file (.csv, .xlsx, .xls).');
        return;
    }

    // Store the file name globally
    csvFileName = file.name;

    showLoading('Processing uploaded file...');
    showFileIndicator(file.name, 'Processing...', 'loading');
    
    // Update upload area to show file is selected
    document.getElementById('uploadArea').classList.add('file-selected');

    if (fileExtension === 'csv') {
        // Handle CSV files
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                updateLoadingMessage('Parsing CSV data...');
                csvData = parseCSV(e.target.result);
                processDataSuccess();
            } catch (error) {
                processDataError(error);
            }
        };
        reader.readAsText(file);
    } else {
        // Handle Excel files (.xlsx, .xls)
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                updateLoadingMessage('Parsing Excel data...');
                csvData = parseExcel(e.target.result);
                processDataSuccess();
            } catch (error) {
                processDataError(error);
            }
        };
        reader.readAsArrayBuffer(file);
    }
}

function processDataSuccess() {
    updateLoadingMessage('Calculating sheet average...');
    calculateSheetAverage();
    
    updateLoadingMessage('Preparing interface...');
    showDataPreview(csvData);
    populateColumnSelects(csvData.columns);
    showControls();
    
    // Update file indicator with actual stats
    const dataPoints = csvData.data.length;
    showFileIndicator(csvFileName, `${dataPoints} measurement points loaded`, 'active');
    
    hideLoading();
}

function processDataError(error) {
    hideLoading();
    showFileIndicator(csvFileName, 'Error parsing file', 'error');
    alert('Error parsing file: ' + error.message);
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
        throw new Error('CSV file must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index];
            });
            data.push(row);
        }
    }

    return {
        columns: headers,
        data: data
    };
}

function parseExcel(arrayBuffer) {
    try {
        // Read the Excel file using SheetJS
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        if (!worksheet) {
            throw new Error('No worksheet found in Excel file');
        }
        
        // Convert worksheet to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
            throw new Error('Excel file must have at least a header row and one data row');
        }
        
        // Extract headers (first row)
        const headers = jsonData[0].map(header => String(header).trim());
        
        // Extract data rows (skip header row)
        const data = [];
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row.length > 0) {
                const dataRow = {};
                headers.forEach((header, index) => {
                    dataRow[header] = row[index] !== undefined ? String(row[index]).trim() : '';
                });
                data.push(dataRow);
            }
        }
        
        return {
            columns: headers,
            data: data
        };
    } catch (error) {
        throw new Error('Error parsing Excel file: ' + error.message);
    }
}

function showDataPreview(data) {
    const previewSection = document.getElementById('dataPreview');
    const table = document.getElementById('previewTable');
    
    // Clear existing table
    table.innerHTML = '';
    
    // Create header row
    const headerRow = document.createElement('tr');
    data.columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);
    
    // Create data rows (show all rows initially)
    data.data.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.className = index >= 10 ? 'hidden-row' : 'visible-row';
        
        data.columns.forEach(column => {
            const td = document.createElement('td');
            td.textContent = row[column];
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });
    
    // Add expand/collapse functionality
    const toggleButton = document.createElement('button');
    toggleButton.textContent = `Show All ${data.data.length} Points`;
    toggleButton.className = 'toggle-preview-btn';
    toggleButton.onclick = function() {
        const hiddenRows = table.querySelectorAll('.hidden-row');
        const visibleRows = table.querySelectorAll('.visible-row');
        
        if (hiddenRows.length > 0) {
            // Expand: show all rows
            hiddenRows.forEach(row => {
                row.style.display = 'table-row';
                row.classList.remove('hidden-row');
                row.classList.add('visible-row');
            });
            toggleButton.textContent = `Show First 10 Points`;
            toggleButton.classList.add('collapsed');
        } else {
            // Collapse: show only first 10 rows
            visibleRows.forEach((row, index) => {
                if (index >= 10) {
                    row.style.display = 'none';
                    row.classList.remove('visible-row');
                    row.classList.add('hidden-row');
                }
            });
            toggleButton.textContent = `Show All ${data.data.length} Points`;
            toggleButton.classList.remove('collapsed');
        }
    };
    
    // Clear any existing toggle button
    const existingToggle = previewSection.querySelector('.toggle-preview-btn');
    if (existingToggle) {
        existingToggle.remove();
    }
    
    // Insert toggle button after the table
    const tableContainer = previewSection.querySelector('.table-container');
    tableContainer.appendChild(toggleButton);
    
    // Initially hide rows beyond the first 10
    const allRows = table.querySelectorAll('tr');
    allRows.forEach((row, index) => {
        if (index > 10) { // Skip header row (index 0) and first 10 data rows
            row.style.display = 'none';
            row.classList.add('hidden-row');
        }
    });
    
    previewSection.style.display = 'block';
    previewSection.classList.add('fade-in');
}

function populateColumnSelects(columns) {
    const xColumn = document.getElementById('xColumn');
    const yColumn = document.getElementById('yColumn');
    const valueColumn = document.getElementById('valueColumn');
    
    // Clear existing options
    [xColumn, yColumn, valueColumn].forEach(select => {
        select.innerHTML = '';
    });
    
    // Add options
    columns.forEach(column => {
        [xColumn, yColumn, valueColumn].forEach(select => {
            const option = document.createElement('option');
            option.value = column;
            option.textContent = column;
            select.appendChild(option);
        });
    });
    
    // Set default selections for hockey rink data
    xColumn.value = 'x-axis';
    yColumn.value = 'y-axis';
    valueColumn.value = 'measurement';
}

function showControls() {
    document.getElementById('controlsSection').style.display = 'block';
    document.getElementById('controlsSection').classList.add('fade-in');
}

function showDebugInfo(info) {
    const debugSection = document.getElementById('debugSection');
    const debugInfo = document.getElementById('debugInfo');
    
    debugInfo.innerHTML = `
        <p><strong>Data File:</strong> ${info.csvData ? 'Loaded' : 'Not loaded'}</p>
        <p><strong>File Name:</strong> ${info.csvData ? csvFileName : 'No file uploaded'}</p>
        <p><strong>File Type:</strong> ${info.csvData ? (csvFileName.toLowerCase().endsWith('.csv') ? 'CSV' : 'Excel') : 'None'}</p>
        <p><strong>Sheet Average:</strong> ${info.sheetAverage ? info.sheetAverage.toFixed(2) + ' inches' : 'Not calculated'}</p>
        <p><strong>Data Points:</strong> ${info.dataPoints || 0}</p>
        <p><strong>Heat Map Points:</strong> ${info.heatMapPoints || 0}</p>
        <p><strong>Chart Created:</strong> ${info.chartCreated ? 'Yes' : 'No'}</p>
        <p><strong>Plotly.js Version:</strong> ${info.plotlyVersion || 'Not loaded'}</p>
    `;
    
    debugSection.style.display = 'block';
}

function generateHeatMap() {
    console.log('generateHeatMap called');
    console.log('csvData:', csvData);
    
    if (!csvData) {
        alert('Please upload a CSV or Excel file first.');
        return;
    }

    const xColumn = document.getElementById('xColumn').value;
    const yColumn = document.getElementById('yColumn').value;
    const valueColumn = document.getElementById('valueColumn').value;

    console.log('Selected columns:', { xColumn, yColumn, valueColumn });

    if (!xColumn || !yColumn || !valueColumn) {
        alert('Please select all required columns.');
        return;
    }

    showLoading('Generating heat map...');

    // Process data for heat map
    updateLoadingMessage('Processing measurement data...');
    const heatMapData = processDataForHeatMap(csvData.data, xColumn, yColumn, valueColumn);
    console.log('Processed heat map data:', heatMapData);
    
    if (heatMapData.length === 0) {
        hideLoading();
        alert('No valid data found for the selected columns.');
        return;
    }

    // Create heat map
    updateLoadingMessage('Creating visualization...');
    setTimeout(() => {
        createHockeyRinkHeatMap(heatMapData, xColumn, yColumn, valueColumn);
        
        // Show visualization section
        document.getElementById('visualizationSection').style.display = 'block';
        document.getElementById('visualizationSection').classList.add('fade-in');
        
        // Show debug information
        showDebugInfo({
            csvData: !!csvData,
            sheetAverage: sheetAverage,
            dataPoints: heatMapData.length,
            heatMapPoints: 'Calculating...',
            chartCreated: !!heatMapChart,
            plotlyVersion: typeof Plotly !== 'undefined' ? Plotly.version || 'Loaded' : 'Not loaded',
            xColumn: xColumn,
            yColumn: yColumn,
            valueColumn: valueColumn
        });
        
        hideLoading();
    }, 100);
}

function processDataForHeatMap(data, xCol, yCol, valueCol) {
    const heatMapData = [];
    
    data.forEach(row => {
        if (row[xCol] && row[yCol] && row[valueCol]) {
            const x = parseFloat(row[xCol]);
            const y = parseFloat(row[yCol]);
            const value = parseFloat(row[valueCol]);
            
            if (!isNaN(x) && !isNaN(y) && !isNaN(value)) {
                heatMapData.push({
                    x: x,
                    y: y,
                    v: value
                });
            }
        }
    });
    
    return heatMapData;
}

function createHockeyRinkHeatMap(data, xCol, yCol, valueCol) {
    console.log('createHockeyRinkHeatMap called with:', { data, xCol, yCol, valueCol });
    console.log('Sheet average:', sheetAverage);
    
    const chartContainer = document.getElementById('heatMapChart');
    
    // Clear existing chart
    chartContainer.innerHTML = '';
    
    // Create a grid for the hockey rink (200x85 feet)
    const gridSize = 5; // 5-foot grid squares
    const xGrid = Math.ceil(200 / gridSize);
    const yGrid = Math.ceil(85 / gridSize);
    
    console.log('Grid dimensions:', { xGrid, yGrid, gridSize });
    
    // Create individual data points for the heat map
    heatMapPoints = []; // Use global variable
    const tolerance = 0.25; // 0.25 inch tolerance for neutral color
    
    for (let y = 0; y < yGrid; y++) {
        const yPos = y * gridSize + gridSize / 2;
        
        for (let x = 0; x < xGrid; x++) {
            const xPos = x * gridSize + gridSize / 2;
            
            // Find the closest measurement point
            let closestPoint = null;
            let minDistance = Infinity;
            
            data.forEach(point => {
                const distance = Math.sqrt(Math.pow(point.x - xPos, 2) + Math.pow(point.y - yPos, 2));
                if (distance < minDistance) {
                    minDistance = distance;
                    closestPoint = point;
                }
            });
            
            // Use interpolation for smoother visualization
            let interpolatedValue = null;
            if (closestPoint && minDistance < gridSize * 2) {
                // Simple inverse distance weighting interpolation
                const nearbyPoints = data.filter(point => {
                    const distance = Math.sqrt(Math.pow(point.x - xPos, 2) + Math.pow(point.y - yPos, 2));
                    return distance < gridSize * 3;
                });
                
                if (nearbyPoints.length > 0) {
                    let totalWeight = 0;
                    let weightedSum = 0;
                    
                    nearbyPoints.forEach(point => {
                        const distance = Math.sqrt(Math.pow(point.x - xPos, 2) + Math.pow(point.y - yPos, 2));
                        if (distance > 0) {
                            const weight = 1 / (distance * distance);
                            totalWeight += weight;
                            weightedSum += point.v * weight;
                        }
                    });
                    
                    interpolatedValue = weightedSum / totalWeight;
                }
            }
            
            if (interpolatedValue !== null) {
                // Determine color based on sheet average
                const diff = interpolatedValue - sheetAverage;
                let color;
                
                if (Math.abs(diff) <= tolerance) {
                    color = 'rgba(255, 255, 255, 0.8)'; // White for neutral
                } else if (diff > tolerance) {
                    // Red shades for above average
                    const intensity = Math.min(1, Math.abs(diff) / 2);
                    color = `rgba(255, ${Math.floor(255 * (1 - intensity))}, ${Math.floor(255 * (1 - intensity))}, 0.8)`;
                } else {
                    // Blue shades for below average
                    const intensity = Math.min(1, Math.abs(diff) / 2);
                    color = `rgba(${Math.floor(255 * (1 - intensity))}, ${Math.floor(255 * (1 - intensity))}, 255, 0.8)`;
                }
                
                heatMapPoints.push({
                    x: xPos,
                    y: yPos,
                    value: interpolatedValue,
                    color: color,
                    diff: diff
                });
            }
        }
    }
    
    console.log('Generated heat map points:', heatMapPoints.length);
    console.log('Sample points:', heatMapPoints.slice(0, 5));
    
    // Calculate highest and lowest points from the original data
    let highestPoint = null;
    let lowestPoint = null;
    
    if (data && data.length > 0) {
        let maxValue = -Infinity;
        let minValue = Infinity;
        
        data.forEach(point => {
            const value = point.v;
            if (!isNaN(value)) {
                if (value > maxValue) {
                    maxValue = value;
                    highestPoint = {
                        x: point.x,
                        y: point.y,
                        value: value
                    };
                }
                if (value < minValue) {
                    minValue = value;
                    lowestPoint = {
                        x: point.x,
                        y: point.y,
                        value: value
                    };
                }
            }
        });
    }
    
    // Update debug info with heat map points count
    const debugInfo = document.getElementById('debugInfo');
    if (debugInfo) {
        const heatMapPointsText = debugInfo.innerHTML.replace(
            /<p><strong>Heat Map Points:<\/strong>.*?<\/p>/,
            `<p><strong>Heat Map Points:</strong> ${heatMapPoints.length}</p>`
        );
        debugInfo.innerHTML = heatMapPointsText;
    }
    
    // Prepare data for Plotly
    const xValues = heatMapPoints.map(point => point.x);
    const yValues = heatMapPoints.map(point => point.y);
    const colors = heatMapPoints.map(point => point.color);
    const values = heatMapPoints.map(point => point.value);
    const diffs = heatMapPoints.map(point => point.diff);
    
    // Create hover text
    const hoverText = heatMapPoints.map(point => {
        const diff = point.diff;
        let status = '';
        if (Math.abs(diff) <= 0.25) {
            status = ' (Neutral)';
        } else if (diff > 0.25) {
            status = ' (Above Average)';
        } else {
            status = ' (Below Average)';
        }
        return `Position: ${point.x.toFixed(0)}' x ${point.y.toFixed(0)}'<br>Ice Depth: ${point.value.toFixed(2)} inches${status}`;
    });
    
    const trace = {
        x: xValues,
        y: yValues,
        mode: 'markers',
        type: 'scatter',
        marker: {
            size: 8,
            color: colors,
            line: {
                color: 'rgba(255, 255, 255, 0.3)',
                width: 1
            }
        },
        text: hoverText,
        hoverinfo: 'text',
        hoverlabel: {
            bgcolor: 'rgba(0, 0, 0, 0.8)',
            bordercolor: 'white',
            font: {
                color: 'white'
            }
        },
        showlegend: false
    };
    
    const layout = {
        title: {
            text: `Hockey Rink Ice Depth Heat Map (Sheet Average: ${sheetAverage.toFixed(2)} inches)`,
            font: {
                size: 16,
                weight: 'bold'
            }
        },
        xaxis: {
            title: 'Rink Length (feet)',
            range: [0, 200],
            gridcolor: 'rgba(0, 0, 0, 0.1)',
            showgrid: true,
            zeroline: false
        },
        yaxis: {
            title: 'Rink Width (feet)',
            range: [0, 85],
            gridcolor: 'rgba(0, 0, 0, 0.1)',
            showgrid: true,
            zeroline: false
        },
        plot_bgcolor: 'rgba(0, 0, 0, 0)',
        paper_bgcolor: 'rgba(0, 0, 0, 0)',
        margin: {
            l: 60,
            r: 40,
            t: 80,
            b: 60
        },
        hovermode: 'closest'
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        displaylogo: false
    };
    
    // Create the plot
    console.log('About to create Plotly chart...');
    console.log('Plotly available:', typeof Plotly !== 'undefined');
    console.log('Chart container:', chartContainer);
    console.log('Trace data:', trace);
    console.log('Layout:', layout);
    
    if (typeof Plotly === 'undefined') {
        console.error('Plotly is not loaded!');
        alert('Error: Plotly.js library is not loaded. Please refresh the page.');
        return;
    }
    
    Plotly.newPlot(chartContainer, [trace], layout, config).then(() => {
        console.log('Plotly chart created successfully');
        
        // Update debug info with chart creation status and heat map points count
        if (debugInfo) {
            let updatedHtml = debugInfo.innerHTML;
            
            // Update chart created status
            updatedHtml = updatedHtml.replace(
                /<p><strong>Chart Created:<\/strong>.*?<\/p>/,
                `<p><strong>Chart Created:</strong> Yes</p>`
            );
            
            // Update heat map points count
            updatedHtml = updatedHtml.replace(
                /<p><strong>Heat Map Points:<\/strong>.*?<\/p>/,
                `<p><strong>Heat Map Points:</strong> ${heatMapPoints.length}</p>`
            );
            
            debugInfo.innerHTML = updatedHtml;
        }
    }).catch(error => {
        console.error('Error creating Plotly chart:', error);
        alert('Error creating chart: ' + error.message);
    });
    
    // Create legend
    createHockeyRinkLegend(data, highestPoint, lowestPoint);
}

function createHockeyRinkLegend(data, highestPoint = null, lowestPoint = null) {
    const legend = document.getElementById('legend');
    legend.innerHTML = '';
    
    // Safely extract values from the data
    const values = [];
    data.forEach(d => {
        if (d && typeof d === 'object') {
            // Handle both data structures: {x, y, v} and {x-axis, y-axis, measurement}
            const value = d.v || d.value || d.measurement;
            if (value !== null && value !== undefined && !isNaN(parseFloat(value))) {
                values.push(parseFloat(value));
            }
        }
    });
    
    if (values.length === 0) {
        console.warn('No valid values found for legend');
        return;
    }
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const tolerance = 0.25;
    
    // Create main legend container
    const legendContainer = document.createElement('div');
    legendContainer.style.cssText = `
        background: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin: 0 auto;
    `;
    
    // Title
    const title = document.createElement('h3');
    title.textContent = 'Ice Depth Legend';
    title.style.cssText = `
        margin: 0 0 20px 0;
        text-align: center;
        color: #333;
        font-size: 18px;
        font-weight: 600;
    `;
    legendContainer.appendChild(title);
    
    // Main content container - horizontal layout
    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 32px;
        flex-wrap: wrap;
        justify-content: center;
    `;
    
    // Color legend section - horizontal
    const colorSection = document.createElement('div');
    colorSection.style.cssText = `
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
    `;
    
    // Below average (blue)
    const belowItem = document.createElement('div');
    belowItem.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    belowItem.innerHTML = `
        <div style="background-color: rgba(0, 0, 255, 0.8); width: 24px; height: 16px; border-radius: 3px;"></div>
        <span style="font-size: 14px; color: #333;">Below (< ${(sheetAverage - tolerance).toFixed(2)}")</span>
    `;
    colorSection.appendChild(belowItem);
    
    // Neutral (white)
    const neutralItem = document.createElement('div');
    neutralItem.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    neutralItem.innerHTML = `
        <div style="background-color: rgba(255, 255, 255, 0.8); width: 24px; height: 16px; border-radius: 3px; border: 1px solid #ccc;"></div>
        <span style="font-size: 14px; color: #333;">Neutral</span>
    `;
    colorSection.appendChild(neutralItem);
    
    // Above average (red)
    const aboveItem = document.createElement('div');
    aboveItem.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    aboveItem.innerHTML = `
        <div style="background-color: rgba(255, 0, 0, 0.8); width: 24px; height: 16px; border-radius: 3px;"></div>
        <span style="font-size: 14px; color: #333;">Above (> ${(sheetAverage + tolerance).toFixed(2)}")</span>
    `;
    colorSection.appendChild(aboveItem);
    
    contentContainer.appendChild(colorSection);
    
    // Statistics section - horizontal
    const statsSection = document.createElement('div');
    statsSection.style.cssText = `
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
    `;
    
    // Sheet average
    const avgInfo = document.createElement('div');
    avgInfo.style.cssText = `
        font-weight: 600;
        color: #333;
        font-size: 16px;
        padding: 8px 12px;
        background: #ffffff;
        border-radius: 6px;
        border: 1px solid #e0e0e0;
    `;
    avgInfo.textContent = `Avg: ${sheetAverage.toFixed(2)}"`;
    statsSection.appendChild(avgInfo);
    
    // Highest and lowest points - horizontal
    if (highestPoint && lowestPoint) {
        const highestDiv = document.createElement('div');
        highestDiv.style.cssText = `
            padding: 8px 12px;
            background: rgba(255, 0, 0, 0.1);
            border: 2px solid rgba(255, 0, 0, 0.8);
            border-radius: 6px;
            text-align: center;
        `;
        highestDiv.innerHTML = `
            <div style="font-weight: 600; color: #d32f2f; font-size: 12px;">HIGH</div>
            <div style="font-size: 14px; color: #333;">${highestPoint.value.toFixed(2)}"</div>
            <div style="font-size: 11px; color: #666;">(${highestPoint.x.toFixed(0)}', ${highestPoint.y.toFixed(0)}')</div>
        `;
        
        const lowestDiv = document.createElement('div');
        lowestDiv.style.cssText = `
            padding: 8px 12px;
            background: rgba(0, 0, 255, 0.1);
            border: 2px solid rgba(0, 0, 255, 0.8);
            border-radius: 6px;
            text-align: center;
        `;
        lowestDiv.innerHTML = `
            <div style="font-weight: 600; color: #1976d2; font-size: 12px;">LOW</div>
            <div style="font-size: 14px; color: #333;">${lowestPoint.value.toFixed(2)}"</div>
            <div style="font-size: 11px; color: #666;">(${lowestPoint.x.toFixed(0)}', ${lowestPoint.y.toFixed(0)}')</div>
        `;
        
        statsSection.appendChild(highestDiv);
        statsSection.appendChild(lowestDiv);
    }
    
    // Range info
    const rangeInfo = document.createElement('div');
    rangeInfo.style.cssText = `
        font-size: 13px;
        color: #666;
        padding: 8px 12px;
        background: #ffffff;
        border-radius: 6px;
        border: 1px solid #e0e0e0;
    `;
    rangeInfo.textContent = `Range: ${min.toFixed(2)}"-${max.toFixed(2)}"`;
    statsSection.appendChild(rangeInfo);
    
    contentContainer.appendChild(statsSection);
    legendContainer.appendChild(contentContainer);
    legend.appendChild(legendContainer);
}

// Utility function to download the heat map as an image
function downloadHeatMap() {
    const chartContainer = document.getElementById('heatMapChart');
    if (chartContainer && chartContainer.data) {
        Plotly.toImage(chartContainer, {
            format: 'png',
            width: 800,
            height: 600
        }).then(function(dataUrl) {
            const link = document.createElement('a');
            link.download = 'hockey-rink-ice-depth-heatmap.png';
            link.href = dataUrl;
            link.click();
        });
    }
}

// Add download button functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize event listeners
    initializeEventListeners();
    
    // Add download button after chart is created
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download Heat Map';
    downloadBtn.className = 'upload-btn download-btn';
    downloadBtn.style.marginTop = '20px';
    downloadBtn.onclick = downloadHeatMap;
    
    document.getElementById('visualizationSection').appendChild(downloadBtn);
});

function showError(message) {
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        background: #ff6b6b;
        color: white;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
        text-align: center;
        font-weight: 600;
    `;
    errorDiv.textContent = message;
    
    // Insert error message after header
    const header = document.querySelector('header');
    header.parentNode.insertBefore(errorDiv, header.nextSibling);
}