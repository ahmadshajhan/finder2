import { NextResponse } from 'next/server';
// User മോഡലും dbConnect ഫംഗ്ഷനും ഇമ്പോർട്ട് ചെയ്യുന്നു
import User, { dbConnect } from '@/models/User'; 

export async function POST(request) {
    try {
        await dbConnect(); // MongoDB-യുമായി ബന്ധിപ്പിക്കുന്നു

        const body = await request.json();
        const { yourName, yourAge, crushName, calculatedPercentage } = body;

        // ഡാറ്റാ Validation
        if (!yourName || !yourAge || !crushName || calculatedPercentage === undefined) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // പുതിയ യൂസർ ഡാറ്റ ക്രിയേറ്റ് ചെയ്യുന്നു
        const newUser = new User({
            yourName,
            yourAge: parseInt(yourAge),
            crushName,
            calculatedPercentage,
        });

        // ഡാറ്റാബേസിൽ സേവ് ചെയ്യുന്നു
        await newUser.save();
        
        return NextResponse.json(
            { message: 'Love calculation saved successfully!', data: newUser },
            { status: 201 }
        );
    } catch (error) {
        // ഡാറ്റാബേസ് കണക്ഷൻ എറർ ഉൾപ്പെടെയുള്ളവ ഇവിടെ പിടിക്കപ്പെടുന്നു
        console.error('API Server Error (POST /api/calculate):', error);
        
        // ക്ലയിന്റിന് വ്യക്തമായ സന്ദേശം നൽകുന്നു
        return NextResponse.json(
            { 
                message: 'Error saving data to database.', 
                errorDetail: error.message 
            },
            { status: 500 }
        );
    }
}