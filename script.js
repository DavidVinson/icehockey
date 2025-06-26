// Global variables
let csvData = null;
let heatMapChart = null;
let sheetAverage = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
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
    uploadArea.addEventListener('click', () => fileInput.click());
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
    }
}

function processFile(file) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Please select a CSV file.');
        return;
    }

    showLoading('Processing uploaded file...');
    showFileIndicator(file.name, 'Processing...', 'loading');
    
    // Update upload area to show file is selected
    document.getElementById('uploadArea').classList.add('file-selected');

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            updateLoadingMessage('Parsing CSV data...');
            csvData = parseCSV(e.target.result);
            
            updateLoadingMessage('Calculating sheet average...');
            calculateSheetAverage();
            
            updateLoadingMessage('Preparing interface...');
            showDataPreview(csvData);
            populateColumnSelects(csvData.columns);
            showControls();
            
            // Update file indicator with actual stats
            const dataPoints = csvData.data.length;
            showFileIndicator(file.name, `${dataPoints} measurement points loaded`, 'active');
            
            hideLoading();
        } catch (error) {
            hideLoading();
            showFileIndicator(file.name, 'Error parsing file', 'error');
            alert('Error parsing CSV file: ' + error.message);
        }
    };
    reader.readAsText(file);
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
    
    // Create data rows (show first 10 rows)
    const rowsToShow = Math.min(10, data.data.length);
    for (let i = 0; i < rowsToShow; i++) {
        const row = document.createElement('tr');
        data.columns.forEach(column => {
            const td = document.createElement('td');
            td.textContent = data.data[i][column];
            row.appendChild(td);
        });
        table.appendChild(row);
    }
    
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
        <p><strong>CSV Data:</strong> ${info.csvData ? 'Loaded' : 'Not loaded'}</p>
        <p><strong>Sheet Average:</strong> ${info.sheetAverage ? info.sheetAverage.toFixed(2) + ' inches' : 'Not calculated'}</p>
        <p><strong>Data Points:</strong> ${info.dataPoints || 0}</p>
        <p><strong>Heat Map Points:</strong> ${info.heatMapPoints || 0}</p>
        <p><strong>Chart Created:</strong> ${info.chartCreated ? 'Yes' : 'No'}</p>
        <p><strong>Canvas Element:</strong> ${document.getElementById('heatMapChart') ? 'Found' : 'Not found'}</p>
        <p><strong>Chart.js Version:</strong> ${Chart.version || 'Unknown'}</p>
    `;
    
    debugSection.style.display = 'block';
}

function generateHeatMap() {
    console.log('generateHeatMap called');
    console.log('csvData:', csvData);
    
    if (!csvData) {
        alert('Please upload a CSV file first.');
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
            chartJsVersion: Chart.version
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
    
    const ctx = document.getElementById('heatMapChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (heatMapChart) {
        heatMapChart.destroy();
    }
    
    // Create a grid for the hockey rink (200x85 feet)
    const gridSize = 5; // 5-foot grid squares
    const xGrid = Math.ceil(200 / gridSize);
    const yGrid = Math.ceil(85 / gridSize);
    
    console.log('Grid dimensions:', { xGrid, yGrid, gridSize });
    
    // Create individual data points for the heat map
    const heatMapPoints = [];
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
                let backgroundColor;
                
                if (Math.abs(diff) <= tolerance) {
                    backgroundColor = 'rgba(255, 255, 255, 0.8)'; // White for neutral
                } else if (diff > tolerance) {
                    // Red shades for above average
                    const intensity = Math.min(1, Math.abs(diff) / 2);
                    backgroundColor = `rgba(255, ${Math.floor(255 * (1 - intensity))}, ${Math.floor(255 * (1 - intensity))}, 0.8)`;
                } else {
                    // Blue shades for below average
                    const intensity = Math.min(1, Math.abs(diff) / 2);
                    backgroundColor = `rgba(${Math.floor(255 * (1 - intensity))}, ${Math.floor(255 * (1 - intensity))}, 255, 0.8)`;
                }
                
                heatMapPoints.push({
                    x: xPos,
                    y: yPos,
                    r: gridSize * 0.8, // Point radius
                    backgroundColor: backgroundColor,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    borderWidth: 1,
                    value: interpolatedValue
                });
            }
        }
    }
    
    console.log('Generated heat map points:', heatMapPoints.length);
    console.log('Sample points:', heatMapPoints.slice(0, 5));
    
    // Update debug info with heat map points count
    const debugInfo = document.getElementById('debugInfo');
    if (debugInfo) {
        const heatMapPointsText = debugInfo.innerHTML.replace(
            /<p><strong>Heat Map Points:<\/strong>.*?<\/p>/,
            `<p><strong>Heat Map Points:</strong> ${heatMapPoints.length}</p>`
        );
        debugInfo.innerHTML = heatMapPointsText;
    }
    
    // Create the chart with individual data points
    heatMapChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Ice Depth',
                data: heatMapPoints,
                backgroundColor: heatMapPoints.map(point => point.backgroundColor),
                borderColor: heatMapPoints.map(point => point.borderColor),
                borderWidth: heatMapPoints.map(point => point.borderWidth),
                pointRadius: heatMapPoints.map(point => point.r),
                pointHoverRadius: 8,
                pointHoverBackgroundColor: 'rgba(0, 0, 0, 0.8)',
                pointHoverBorderColor: 'white',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Hockey Rink Ice Depth Heat Map (Sheet Average: ${sheetAverage.toFixed(2)} inches)`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const point = context[0].raw;
                            return `Position: ${point.x.toFixed(0)}' x ${point.y.toFixed(0)}'`;
                        },
                        label: function(context) {
                            const point = context[0].raw;
                            const value = point.value;
                            const diff = value - sheetAverage;
                            let status = '';
                            if (Math.abs(diff) <= 0.25) {
                                status = ' (Neutral)';
                            } else if (diff > 0.25) {
                                status = ' (Above Average)';
                            } else {
                                status = ' (Below Average)';
                            }
                            return `Ice Depth: ${value.toFixed(2)} inches${status}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    min: 0,
                    max: 200,
                    title: {
                        display: true,
                        text: 'Rink Length (feet)'
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        stepSize: 25
                    }
                },
                y: {
                    type: 'linear',
                    min: 0,
                    max: 85,
                    title: {
                        display: true,
                        text: 'Rink Width (feet)'
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        stepSize: 10
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'nearest'
            }
        }
    });
    
    console.log('Chart created successfully');
    
    // Update debug info with chart creation status
    if (debugInfo) {
        const chartCreatedText = debugInfo.innerHTML.replace(
            /<p><strong>Chart Created:<\/strong>.*?<\/p>/,
            `<p><strong>Chart Created:</strong> Yes</p>`
        );
        debugInfo.innerHTML = chartCreatedText;
    }
    
    // Create legend
    createHockeyRinkLegend(data);
}

function createHockeyRinkLegend(data) {
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
    
    // Create legend items
    const legendContainer = document.createElement('div');
    legendContainer.style.display = 'flex';
    legendContainer.style.alignItems = 'center';
    legendContainer.style.gap = '15px';
    legendContainer.style.flexWrap = 'wrap';
    legendContainer.style.justifyContent = 'center';
    legendContainer.style.padding = '20px';
    legendContainer.style.background = '#f8f9fa';
    legendContainer.style.borderRadius = '10px';
    
    // Below average (blue)
    const belowItem = document.createElement('div');
    belowItem.className = 'legend-item';
    belowItem.innerHTML = `
        <div class="legend-color" style="background-color: rgba(0, 0, 255, 0.8); width: 30px; height: 20px;"></div>
        <span>Below Average (< ${(sheetAverage - tolerance).toFixed(2)}")</span>
    `;
    legendContainer.appendChild(belowItem);
    
    // Neutral (white)
    const neutralItem = document.createElement('div');
    neutralItem.className = 'legend-item';
    neutralItem.innerHTML = `
        <div class="legend-color" style="background-color: rgba(255, 255, 255, 0.8); width: 30px; height: 20px; border: 1px solid #ccc;"></div>
        <span>Neutral (${(sheetAverage - tolerance).toFixed(2)}" - ${(sheetAverage + tolerance).toFixed(2)}")</span>
    `;
    legendContainer.appendChild(neutralItem);
    
    // Above average (red)
    const aboveItem = document.createElement('div');
    aboveItem.className = 'legend-item';
    aboveItem.innerHTML = `
        <div class="legend-color" style="background-color: rgba(255, 0, 0, 0.8); width: 30px; height: 20px;"></div>
        <span>Above Average (> ${(sheetAverage + tolerance).toFixed(2)}")</span>
    `;
    legendContainer.appendChild(aboveItem);
    
    // Sheet average info
    const avgInfo = document.createElement('div');
    avgInfo.style.marginTop = '10px';
    avgInfo.style.fontWeight = 'bold';
    avgInfo.style.color = '#333';
    avgInfo.textContent = `Sheet Average: ${sheetAverage.toFixed(2)} inches`;
    legendContainer.appendChild(avgInfo);
    
    // Add min/max info
    const rangeInfo = document.createElement('div');
    rangeInfo.style.marginTop = '5px';
    rangeInfo.style.fontSize = '0.9rem';
    rangeInfo.style.color = '#666';
    rangeInfo.textContent = `Range: ${min.toFixed(2)}" - ${max.toFixed(2)}"`;
    legendContainer.appendChild(rangeInfo);
    
    legend.appendChild(legendContainer);
}

// Utility function to download the heat map as an image
function downloadHeatMap() {
    if (heatMapChart) {
        const link = document.createElement('a');
        link.download = 'hockey-rink-ice-depth-heatmap.png';
        link.href = heatMapChart.toBase64Image();
        link.click();
    }
}

// Add download button functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add download button after chart is created
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download Heat Map';
    downloadBtn.className = 'upload-btn';
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