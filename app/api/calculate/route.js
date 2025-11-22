import { NextResponse } from 'next/server';
import User, { dbConnect } from '@/models/User';

// POST request handler
export async function POST(request) {
    try {
        await dbConnect(); // ഡാറ്റാബേസ് കണക്ട് ചെയ്യുന്നു

        const body = await request.json();
        const { yourName, yourAge, crushName, calculatedPercentage } = body;

        // ഡാറ്റാബേസിൽ സേവ് ചെയ്യാനുള്ള പുതിയ യൂസർ ഒബ്ജക്റ്റ്
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
        console.error('API Error:', error);
        return NextResponse.json(
            { message: 'Error saving data to database.', error: error.message },
            { status: 500 }
        );
    }
}