# Backend Setup

## Environment Variables

To run this project, you need to set up your environment variables. Follow these steps:

1. Copy the `.env.example` file and rename it to `.env`:   ```
   cp .env.example .env   ```

2. Open the `.env` file and replace the placeholder values with your actual configuration:   ```
   PORT=3000
   JWT_SECRET=your_very_secure_and_long_random_secret_key   ```

   Make sure to use a strong, unique secret key for JWT_SECRET.

3. Save the file and you're ready to go!

Note: Never commit your `.env` file to version control. It's already added to `.gitignore`.
