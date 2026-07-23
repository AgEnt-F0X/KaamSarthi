import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, PermissionsAndroid } from 'react-native';
import { WebView } from 'react-native-webview';
import { Audio } from 'expo-av';
import * as Constants from 'expo-constants';

export default function Index() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Use the cloud deployed URL
  const webAppUrl = process.env.EXPO_PUBLIC_WEBAPP_URL || 'https://kaamsarthi.vercel.app';

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView 
        source={{ uri: webAppUrl }} 
        style={styles.webview}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
});
