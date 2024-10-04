// Function to send a welcome email using SendGrid
async function sendWelcomeEmail(email: string) {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get("SENDGRID_API_KEY_SUPABASE")}`, // Use the SendGrid API key from environment variable
        },
        body: JSON.stringify({
            personalizations: [{
                to: [{ email: email }],
                subject: 'Welcome to SatPracticeBot!',
            }],
            from: { email: 'gabriel@garzaconsulting.dev' }, // Replace with your verified sender email
            content: [{
                type: 'text/plain',
                value: 'Thank you for joining us! We are excited to have you on board.',
            }],
        }),
    });

    if (!response.ok) {
        console.error(`Failed to send email: ${response.statusText}`);
        throw new Error(`Failed to send email: ${response.statusText}`);
    }

    return response.json();
}

// Trigger function on insert to email_list table
Deno.serve(async (req) => {
    const { record } = await req.json();
    console.log(record);
    const email: string = record.email; // Get the email from the new record

    await sendWelcomeEmail(email); // Send welcome email

    return new Response(null);
});
