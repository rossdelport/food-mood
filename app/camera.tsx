import { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, type CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LibraryIcon, FlipIcon, CloseIcon } from '../components/NavIcons';
import { colors, fonts, radius as radii } from '../constants/theme';

// Custom capture screen. The library shortcut only exists here, inside the
// camera view — tapping it switches to the photo library instead.
export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [busy, setBusy] = useState(false);

  const goToMood = (uri: string) => router.replace({ pathname: '/meal-capture', params: { img: uri } });

  const takePhoto = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) goToMood(photo.uri);
    } finally {
      setBusy(false);
    }
  };

  const openLibrary = async () => {
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
    return (
      <View style={[styles.black, styles.permWrap]}>
        <Text style={styles.permTitle}>Camera access</Text>
        <Text style={styles.permBody}>Allow camera access to capture a meal, or pick one from your library.</Text>
        <Pressable style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Allow camera</Text>
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
