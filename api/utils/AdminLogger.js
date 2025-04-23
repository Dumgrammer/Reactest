const fs = require('fs');
const path = require('path');

// Define the log file path
const logFilePath = path.join(__dirname, '../logs/admin_activity.log');

// Ensure the logs directory exists
const ensureLogDirectory = () => {
    const logDir = path.dirname(logFilePath);
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
};

// Log admin activity
exports.logAdminActivity = (adminId, adminName, action, details = {}) => {
    try {
        ensureLogDirectory();
        
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            adminId,
            adminName,
            action,
            details,
            ip: details.ip || 'unknown'
        };
        
        const logString = `[${timestamp}] Admin: ${adminId} (${adminName}) | Action: ${action} | Details: ${JSON.stringify(details)}\n`;
        
        // Append to the log file
        fs.appendFileSync(logFilePath, logString);
        
        console.log(`Admin activity logged: ${action}`);
        return true;
    } catch (error) {
        console.error('Error logging admin activity:', error);
        return false;
    }
};

// Get admin activity logs
exports.getAdminLogs = (limit = 100) => {
    try {
        ensureLogDirectory();
        
        // Check if log file exists
        if (!fs.existsSync(logFilePath)) {
            return [];
        }
        
        // Read the log file
        const logContent = fs.readFileSync(logFilePath, 'utf8');
        const logLines = logContent.split('\n').filter(line => line.trim() !== '');
        
        // Return the most recent logs (up to the limit)
        return logLines.slice(-limit).reverse();
    } catch (error) {
        console.error('Error reading admin logs:', error);
        return [];
    }
}; 