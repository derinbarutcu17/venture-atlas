import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    
    await page.goto('http://localhost:5174', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    
    // Find a parent tracking rect. Let's find one by finding a text label.
    // E.g., Ecosystem's child Standard Tech
    const techText = await page.locator(':has-text("Standard Tech")').first();
    const techBox = await techText.boundingBox();
    console.log("Tech box bounding:", techBox);

    if (techBox) {
        // Hover exactly at the center of the text (in the padding region)
        await page.mouse.move(techBox.x + techBox.width/2, techBox.y + techBox.height/2);
        await page.waitForTimeout(500);

        // Check if tooltip is visible
        const tooltip = await page.locator('text=SPECTRUM ANALYSIS').count();
        console.log("Tooltip 'SPECTRUM ANALYSIS' count:", tooltip);
        
        const content = await page.content();
        if (content.includes('SPECTRUM ANALYSIS')) {
            console.log("Tooltip text found in DOM!");
        } else {
            console.log("Tooltip NOT found in DOM.");
        }
    }

    await browser.close();
})();
