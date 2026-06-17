import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { CameraView, type CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LibraryIcon, FlipIcon, CloseIcon } from '../components/NavIcons';
import { hMedium, hSelect } from '../services/haptics';
import { colors, fonts, radius as radii } from '../constants/theme';

// Custom capture screen. The library shortcut only exists here, inside the
// camera view — tapping it switches to the photo library instead.
export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [busy, setBusy] = useState(false);
  const requestedRef = useRef(false);

  // Apple 5.1.1(iv): no custom priming screen with an exit button or an "Allow"
  // button before the system prompt. When permission is still undetermined we go
  // straight to the OS request; the native dialog carries our usage description.
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain && !requestedRef.current) {
      requestedRef.current = true;
      requestPermission();
    }
  }, [permission, requestPermission]);

  const goToMood = (uri: string) => router.replace({ pathname: '/meal-capture', params: { img: uri, ...(date ? { date } : {}) } });

  const takePhoto = async () => {
    if (busy) return;
    setBusy(true);
    hMedium(); // shutter feel
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) goToMood(photo.uri);
    } finally {
      setBusy(false);
    }
  };

  const openLibrary = async () => {
    hSelect();
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, mediaTypes: ['images'] });
    if (!result.canceled && result.assets?.[0]) goToMood(result.assets[0].uri);
  };

  // Permission states
  if (!permission) {
    return <View style={styles.black}><ActivityIndicator color="#fff" /></View>;
  }
  if (!permission.granted) {
    // Undetermined: the effect above is firing the native prompt — just hold a
    // plain screen behind the OS dialog (no priming UI, no exit button).
    if (permission.canAskAgain) {
      return <View style={styles.black}><ActivityIndicator color="#fff" /></View>;
    }
    // Denied: iOS won't re-prompt, so inform the user and link to Settings —
    // explicitly allowed for a feature that can't function without the camera.
    return (
      <View style={[styles.black, styles.permWrap]}>
        <Text style={styles.permTitle}>Camera access</Text>
        <Text style={styles.permBody}>Camera access is turned off. Turn it on in Settings to capture a meal, or pick one from your library.</Text>
        <Pressable style={styles.permBtn} onPress={() => Linking.openSettings()}>
          <Text style={styles.permBtnText}>Open Settings</Text>
        </Pressable>
        <Pressable style={styles.permLibrary} onPress={openLibrary}>
          <Text style={styles.permLibraryText}>Choose from library instead</Text>
        </Pressable>
        <Pressable style={[styles.closeBtn, { top: insets.top + 8 }]} onPress={() => router.back()}>
          <CloseIcon color="#fff" />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.black}>
      <StatusBar style="light" />
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />

      {/* close */}
      <Pressable style={[styles.closeBtn, { top: insets.top + 8 }]} onPress={() => router.back()}>
        <CloseIcon color="#fff" />
      </Pressable>

      {/* bottom controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 28 }]}>
        <Pressable style={styles.sideBtn} onPress={openLibrary}>
          <LibraryIcon color="#fff" size={24} />
        </Pressable>

        <Pressable style={styles.shutter} onPress={takePhoto} disabled={busy}>
          <View style={styles.shutterInner}>
            {busy && <ActivityIndicator color={colors.ink1} />}
          </View>
        </Pressable>

        <Pressable style={styles.sideBtn} onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}>
          <FlipIcon color="#fff" size={24} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  black: { flex: 1, backgroundColor: '#000' },
  closeBtn: {
    position: 'absolute',
    left: 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 36,
  },
  sideBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permWrap: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36, gap: 14 },
  permTitle: { fontFamily: fonts.light, fontSize: 26, color: '#fff', letterSpacing: -0.4 },
  permBody: { fontFamily: fonts.regular, fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 21 },
  permBtn: { marginTop: 8, backgroundColor: '#fff', borderRadius: radii.button, paddingVertical: 15, paddingHorizontal: 40 },
  permBtnText: { fontFamily: fonts.medium, fontSize: 15.5, color: colors.ink1 },
  permLibrary: { paddingVertical: 10 },
  permLibraryText: { fontFamily: fonts.regular, fontSize: 14, color: 'rgba(255,255,255,0.75)' },
});
