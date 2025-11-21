
async function testSave() {
    const API_URL = 'http://localhost:3001/api/repairs';

    const testRepair = {
        name: "Test Repair Automated",
        machineModel: "Vertuo Next Test",
        serialNumber: "TEST-123456",
        messages: [
            {
                role: "USER",
                text: "This is a test message from the automated test script."
            }
        ]
    };

    console.log(`Attempting to save repair to ${API_URL}...`);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testRepair)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Repair saved successfully!');
        console.log('Response data:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Failed to save repair:', error);
        process.exit(1);
    }
}

testSave();
