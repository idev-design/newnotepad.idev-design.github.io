// DOM Elements
const editor = document.getElementById('editor');
const wordCount = document.getElementById('wordCount');
const charCount = document.getElementById('charCount');
const downloadBtn = document.getElementById('downloadBtn');
const filenameInput = document.getElementById('filename');
const fileFormatSelect = document.getElementById('fileFormat');
const themeSelector = document.getElementById('themeSelector');
const autoSaveNotification = document.getElementById('autoSaveNotification');
const fileInput = document.getElementById('fileInput');

// Initialize editor
document.addEventListener('DOMContentLoaded', () => {
    // Load saved content if exists
    loadSavedContent();
    // Initialize word and character count
    updateCounts();
    // Set up auto-save
    initAutoSave();
});

// Text Formatting Functions
document.querySelectorAll('.toolbar button').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const command = button.id;
        
        switch(command) {
            case 'bold':
                document.execCommand('bold', false, null);
                break;
            case 'italic':
                document.execCommand('italic', false, null);
                break;
            case 'underline':
                document.execCommand('underline', false, null);
                break;
            case 'alignLeft':
                document.execCommand('justifyLeft', false, null);
                break;
            case 'alignCenter':
                document.execCommand('justifyCenter', false, null);
                break;
            case 'alignRight':
                document.execCommand('justifyRight', false, null);
                break;
            case 'bulletList':
                document.execCommand('insertUnorderedList', false, null);
                break;
            case 'numberList':
                document.execCommand('insertOrderedList', false, null);
                break;
            case 'newFile':
                if(confirm('Are you sure you want to create a new file? All unsaved changes will be lost.')) {
                    editor.innerHTML = '';
                    filenameInput.value = '';
                }
                break;
            case 'openFile':
                fileInput.click();
                break;
        }
    });
});

// Word and Character Count
function updateCounts() {
    const text = editor.innerText || '';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const characters = text.length;

    wordCount.textContent = words.length;
    charCount.textContent = characters;
}

editor.addEventListener('input', updateCounts);

// Auto-save functionality
function initAutoSave() {
    let timeout;
    editor.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            saveContent();
            showAutoSaveNotification();
        }, 1000);
    });
}

function saveContent() {
    localStorage.setItem('editorContent', editor.innerHTML);
    localStorage.setItem('lastSaved', new Date().toISOString());
}

function loadSavedContent() {
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
        editor.innerHTML = savedContent;
    }
}

function showAutoSaveNotification() {
    autoSaveNotification.style.display = 'block';
    setTimeout(() => {
        autoSaveNotification.style.display = 'none';
    }, 2000);
}

// Theme Switching
themeSelector.addEventListener('change', (e) => {
    const theme = e.target.value;
    document.body.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);
});

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    themeSelector.value = savedTheme;
    document.body.className = `theme-${savedTheme}`;
}

// File Operations
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            editor.innerHTML = e.target.result;
            updateCounts();
        };
        reader.readAsText(file);
    }
});

// Download functionality
downloadBtn.addEventListener('click', () => {
    let filename = filenameInput.value.trim();
    const format = fileFormatSelect.value;
    
    if (!filename) {
        filename = `document-${new Date().toISOString().slice(0,10)}`;
    }

    let content = '';
    let mimeType = '';

    switch(format) {
        case 'txt':
            content = editor.innerText;
            mimeType = 'text/plain';
            break;
        case 'html':
            content = editor.innerHTML;
            mimeType = 'text/html';
            break;
        case 'md':
            content = convertToMarkdown(editor.innerHTML);
            mimeType = 'text/markdown';
            break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
});

// Helper function to convert HTML to Markdown
function convertToMarkdown(html) {
    // This is a simple conversion. For a more robust solution,
    // consider using a library like Turndown
    let markdown = html;
    markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
    markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
    markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n');
    markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n');
    markdown = markdown.replace(/<p>(.*?)<\/p>/g, '$1\n');
    markdown = markdown.replace(/<br>/g, '\n');
    markdown = markdown.replace(/<[^>]*>/g, '');
    return markdown;
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 's':
                e.preventDefault();
                saveContent();
                showAutoSaveNotification();
                break;
            case 'b':
                e.preventDefault();
                document.execCommand('bold', false, null);
                break;
            case 'i':
                e.preventDefault();
                document.execCommand('italic', false, null);
                break;
        }
    }
});

// Error Handling
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ', msg, '\nURL: ', url, '\nLine: ', lineNo, '\nColumn: ', columnNo, '\nError object: ', error);
    return false;
};
