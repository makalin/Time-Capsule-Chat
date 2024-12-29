// Firebase Configuration and Setup
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import SQLite from 'react-native-sqlite-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// Initialize SQLite
const db = SQLite.openDatabase(
  {
    name: 'TimeCapsuleDB',
    location: 'default',
  },
  () => {},
  error => console.error('Error: ', error)
);

// Create local cache table
const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, content TEXT, sender_id TEXT, receiver_id TEXT, unlock_date TEXT, status TEXT)',
      [],
      () => console.log('Table created successfully')
    );
  });
};

// Main App Component
const App = () => {
  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="NewCapsule" component={NewCapsuleScreen} />
        <Stack.Screen name="ViewCapsules" component={ViewCapsulesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Login Screen
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      navigation.replace('Home');
    } catch (error) {
      console.error(error);
      alert('Login failed: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

// New Time Capsule Screen
const NewCapsuleScreen = ({ navigation }) => {
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [unlockDate, setUnlockDate] = useState(new Date());

  const createTimeCapsule = async () => {
    try {
      const currentUser = auth().currentUser;
      const capsuleRef = await firestore().collection('timeCapsules').add({
        content: message,
        sender_id: currentUser.uid,
        receiver_id: recipient,
        unlock_date: unlockDate.toISOString(),
        status: 'locked',
        created_at: firestore.FieldValue.serverTimestamp(),
      });

      // Store in local cache
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO messages (id, content, sender_id, receiver_id, unlock_date, status) VALUES (?, ?, ?, ?, ?, ?)',
          [capsuleRef.id, message, currentUser.uid, recipient, unlockDate.toISOString(), 'locked']
        );
      });

      // Schedule notification
      scheduleCapsuleNotification(capsuleRef.id, unlockDate);
      
      navigation.goBack();
    } catch (error) {
      console.error(error);
      alert('Failed to create time capsule');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Recipient Email"
        value={recipient}
        onChangeText={setRecipient}
      />
      <TextInput
        style={[styles.input, styles.messageInput]}
        placeholder="Your Message"
        value={message}
        onChangeText={setMessage}
        multiline
      />
      <DateTimePicker
        value={unlockDate}
        mode="datetime"
        onChange={(event, date) => setUnlockDate(date)}
      />
      <TouchableOpacity style={styles.button} onPress={createTimeCapsule}>
        <Text style={styles.buttonText}>Send Time Capsule</Text>
      </TouchableOpacity>
    </View>
  );
};

// View Capsules Screen
const ViewCapsulesScreen = () => {
  const [capsules, setCapsules] = useState([]);

  useEffect(() => {
    const currentUser = auth().currentUser;
    
    // Load from local cache first
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM messages WHERE receiver_id = ?',
        [currentUser.uid],
        (_, { rows }) => setCapsules(rows._array)
      );
    });

    // Then fetch from Firebase
    const unsubscribe = firestore()
      .collection('timeCapsules')
      .where('receiver_id', '==', currentUser.uid)
      .onSnapshot(snapshot => {
        const capsuleData = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (new Date(data.unlock_date) <= new Date()) {
            data.status = 'unlocked';
          }
          capsuleData.push({ id: doc.id, ...data });
        });
        setCapsules(capsuleData);
        
        // Update local cache
        updateLocalCache(capsuleData);
      });

    return () => unsubscribe();
  }, []);

  const renderCapsule = ({ item }) => (
    <View style={styles.capsuleItem}>
      <Text style={styles.capsuleDate}>
        Unlock Date: {new Date(item.unlock_date).toLocaleDateString()}
      </Text>
      <Text style={styles.capsuleStatus}>Status: {item.status}</Text>
      {item.status === 'unlocked' && (
        <Text style={styles.capsuleMessage}>{item.content}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={capsules}
        renderItem={renderCapsule}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

// Utility function to schedule notifications
const scheduleCapsuleNotification = async (capsuleId, unlockDate) => {
  // Implementation would use Twilio API to schedule SMS notifications
  // This is a placeholder for the actual implementation
  console.log(`Scheduled notification for capsule ${capsuleId} at ${unlockDate}`);
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  messageInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  capsuleItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  capsuleDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  capsuleStatus: {
    color: '#666',
    marginVertical: 5,
  },
  capsuleMessage: {
    marginTop: 10,
  },
});

export default App;
