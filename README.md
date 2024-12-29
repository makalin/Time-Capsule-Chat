# Time Capsule Chat

A React Native application that allows users to send and receive "time capsule" messages, which can only be unlocked at a specified date. The project integrates Firebase for authentication and backend storage and SQLite for local data management.

## Features

- User authentication via Firebase.
- Send and receive messages with a time-lock feature.
- Local SQLite caching for offline capabilities.
- Intuitive user interface for managing messages and navigation.

## Technologies Used

- **React Native**: For cross-platform mobile application development.
- **Firebase**: Backend services for authentication and data storage.
- **SQLite**: Local database for offline caching.
- **React Navigation**: Seamless navigation within the app.
- **DateTimePicker**: User-friendly date and time selection.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/time-capsule-chat.git
   cd time-capsule-chat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a Firebase project.
   - Add an Android/iOS app to your Firebase project.
   - Download the `google-services.json` (for Android) or `GoogleService-Info.plist` (for iOS) file and place it in the appropriate directory.
   - Enable Firebase Authentication and Firestore.

4. Run the app:
   ```bash
   npm run android # For Android
   npm run ios     # For iOS
   ```

## Usage

1. Register or log in using Firebase Authentication.
2. Compose a new message, specify the recipient and unlock date, and send it.
3. View sent and received messages in the app.
4. Messages unlock automatically when the specified date is reached.

## Database Schema

### SQLite
The app uses the following local SQLite table:

| Column      | Type   | Description                       |
|-------------|--------|-----------------------------------|
| `id`        | TEXT   | Unique identifier for the message |
| `content`   | TEXT   | Message content                   |
| `sender_id` | TEXT   | ID of the sender                  |
| `receiver_id`| TEXT  | ID of the receiver                |
| `unlock_date`| TEXT  | Date when the message can be unlocked |
| `status`    | TEXT   | Message status (e.g., `locked`, `unlocked`) |

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Create a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
