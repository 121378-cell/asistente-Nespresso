
async function testLoad() {
    const API_URL = 'http://localhost:3001/api/repairs';

    console.log(`Attempting to fetch repairs from ${API_URL}...`);

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }

        const repairs = await response.json();
        console.log(`✅ Successfully fetched ${repairs.length} repairs.`);

        if (repairs.length > 0) {
            console.log('Latest repair:', JSON.stringify(repairs[0], null, 2));

            // Check model correlation
            const validModels = ['Zenius ZN 100 PRO', 'Gemini CS 203/223', 'Nespresso Momento'];
            const model = repairs[0].machineModel;

            if (validModels.includes(model)) {
                console.log(`✅ Model "${model}" is valid (exists in checklists).`);
            } else {
                console.log(`⚠️ Model "${model}" is NOT in the known checklists. Valid models are: ${validModels.join(', ')}`);
            }
        } else {
            console.log('⚠️ No repairs found in database.');
        }

    } catch (error) {
        console.error('❌ Failed to fetch repairs:', error);
        process.exit(1);
    }
}

testLoad();
