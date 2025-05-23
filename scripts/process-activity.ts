import { processActivityReport } from '../src/lib/process-activity';

async function main() {
    try {
        const reportId = '00ae9590-e3b1-42d0-9716-ceb84bab2089';
        console.log('Processing activity report:', reportId);
        
        const observation = await processActivityReport(reportId);
        console.log('Successfully processed report. Created observation:', observation);
    } catch (error) {
        console.error('Failed to process activity report:', error);
        process.exit(1);
    }
}

main(); 