// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
        link.classList.add('active');
        
        // Show corresponding section
        const targetId = link.getAttribute('href').substring(1);
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(targetId).classList.add('active');
    });
});

// File Upload Handling
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const processingResult = document.getElementById('processingResult');
const loadingSpinner = document.getElementById('loadingSpinner');

// Drag and drop functionality
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.background = '#e8f5e8';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.background = '#f8f9fa';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.background = '#f8f9fa';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

async function handleFile(file) {
    // Validate file type and size
    if (!file.type.includes('pdf') && !file.name.endsWith('.docx')) {
        alert('Please upload a PDF or DOCX file.');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
    }
    
    // Show loading spinner
    loadingSpinner.style.display = 'flex';
    
    try {
        const formData = new FormData();
        formData.append('resume', file);
        
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayExtractedData(result.data);
            updateStats();
        } else {
            alert('Error processing file: ' + result.error);
        }
    } catch (error) {
        alert('Error uploading file: ' + error.message);
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

function displayExtractedData(data) {
    document.getElementById('resultName').textContent = data.name || 'Not found';
    document.getElementById('resultEmail').textContent = data.email || 'Not found';
    document.getElementById('resultPhone').textContent = data.phone || 'Not found';
    document.getElementById('resultSkills').textContent = data.skills || 'Not found';
    document.getElementById('resultExperience').textContent = data.experience || 'Not found';
    document.getElementById('resultEducation').textContent = data.education || 'Not found';
    
    processingResult.style.display = 'block';
    
    // Scroll to results
    processingResult.scrollIntoView({ behavior: 'smooth' });
}

// Save to Google Sheets
document.getElementById('saveToSheets').addEventListener('click', async () => {
    const name = document.getElementById('resultName').textContent;
    const email = document.getElementById('resultEmail').textContent;
    const phone = document.getElementById('resultPhone').textContent;
    const skills = document.getElementById('resultSkills').textContent;
    const experience = document.getElementById('resultExperience').textContent;
    const education = document.getElementById('resultEducation').textContent;
    
    if (name === 'Not found' && email === 'Not found') {
        alert('No valid data to save.');
        return;
    }
    
    try {
        const response = await fetch('/save-to-sheets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                phone,
                skills,
                experience,
                education
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Data saved to Google Sheets successfully!');
            updateStats();
            loadCandidatesData();
        } else {
            alert('Error saving to Google Sheets: ' + result.error);
        }
    } catch (error) {
        alert('Error saving data: ' + error.message);
    }
});

// Load candidates data
async function loadCandidatesData() {
    try {
        const response = await fetch('/get-candidates');
        const data = await response.json();
        
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = '';
        
        data.candidates.forEach(candidate => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${candidate.name}</td>
                <td>${candidate.email}</td>
                <td>${candidate.phone}</td>
                <td>${candidate.skills}</td>
                <td>${candidate.experience}</td>
                <td>${new Date(candidate.date_added).toLocaleDateString()}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading candidates data:', error);
    }
}

// Update statistics
async function updateStats() {
    try {
        const response = await fetch('/get-stats');
        const stats = await response.json();
        
        document.getElementById('processedCount').textContent = stats.processed;
        document.getElementById('successCount').textContent = stats.successful;
        document.getElementById('candidateCount').textContent = stats.candidates;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Refresh data button
document.getElementById('refreshData').addEventListener('click', () => {
    loadCandidatesData();
    updateStats();
});

// Export CSV
document.getElementById('exportCsv').addEventListener('click', async () => {
    try {
        const response = await fetch('/export-csv');
        const blob = await response.blob();
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'candidates_data.csv';
        
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        alert('Error exporting CSV: ' + error.message);
    }
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    loadCandidatesData();
});