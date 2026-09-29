// import * as Device from 'expo-device';
// import { Platform, StyleSheet } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// import { AnimatedIcon } from '@/components/animated-icon';
// import { HintRow } from '@/components/hint-row';
// import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';
// import { WebBadge } from '@/components/web-badge';
// import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

// function getDevMenuHint() {
//   if (Platform.OS === 'web') {
//     return <ThemedText type="small">use browser devtools</ThemedText>;
//   }
//   if (Device.isDevice) {
//     return (
//       <ThemedText type="small">
//         shake device or press <ThemedText type="code">m</ThemedText> in terminal
//       </ThemedText>
//     );
//   }
//   const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
//   return (
//     <ThemedText type="small">
//       press <ThemedText type="code">{shortcut}</ThemedText>
//     </ThemedText>
//   );
// }

// export default function HomeScreen() {
//   return (
//     <ThemedView style={styles.container}>
//       <SafeAreaView style={styles.safeArea}>
//         <ThemedView style={styles.heroSection}>
//           <AnimatedIcon />
//           <ThemedText type="title" style={styles.title}>
//             Welcome to&nbsp;Expo
//           </ThemedText>
//         </ThemedView>

//         <ThemedText type="code" style={styles.code}>
//           get started
//         </ThemedText>

//         <ThemedView type="backgroundElement" style={styles.stepContainer}>
//           <HintRow
//             title="Try editing"
//             hint={<ThemedText type="code">src/app/index.tsx</ThemedText>}
//           />
//           <HintRow title="Dev tools" hint={getDevMenuHint()} />
//           <HintRow
//             title="Fresh start"
//             hint={<ThemedText type="code">npm run reset-project</ThemedText>}
//           />
//         </ThemedView>

//         {Platform.OS === 'web' && <WebBadge />}
//       </SafeAreaView>
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     flexDirection: 'row',
//   },
//   safeArea: {
//     flex: 1,
//     paddingHorizontal: Spacing.four,
//     alignItems: 'center',
//     gap: Spacing.three,
//     paddingBottom: BottomTabInset + Spacing.three,
//     maxWidth: MaxContentWidth,
//   },
//   heroSection: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     flex: 1,
//     paddingHorizontal: Spacing.four,
//     gap: Spacing.four,
//   },
//   title: {
//     textAlign: 'center',
//   },
//   code: {
//     textTransform: 'uppercase',
//   },
//   stepContainer: {
//     gap: Spacing.three,
//     alignSelf: 'stretch',
//     paddingHorizontal: Spacing.three,
//     paddingVertical: Spacing.four,
//     borderRadius: Spacing.four,
//   },
// });

import { useState } from 'react';
import { GestureResponderEvent, Image, Pressable, StyleSheet, View, Text, Modal, TextInput, Button, LayoutChangeEvent } from 'react-native';

const roomImageSource = require('../../assets/rooms/roomsample.jpeg');
const roomImageInfo = Image.resolveAssetSource(roomImageSource);

const PLACEHOLDER_OPTIONS = ['hammer', 'screwdriver', 'wrench', 'pliers', 'baskets', 'tape measure', 'calligraphy pen', 'alarm clock', 'thumbtacks', 'hangers'];

type Pin = { x: number; y: number; name: string };

export default function HomeScreen() {
    const [pins, setPins] = useState<Pin[]>([]);
    const [pendingTap, setPendingTap] = useState<{ x: number; y: number; } | null>(null);
    const [nameInput, setNameInput] = useState('');
    const [placeholder, setPlaceholder] = useState('e.g screwdriver');
    const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 });

    const onWrapperLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setWrapperSize({ width, height });
    }

    const getImageBounds = () => {
        const { width: W, height: H } = wrapperSize;
        const { width: w, height: h } = roomImageInfo;
        if (!W || !H || !w || !h ) return null;
        const scale = Math.min(W / w, H / h);
        const renderedWidth = w * scale;
        const renderedHeight = h * scale;
        const offsetX = (W - renderedWidth) / 2;
        const offsetY = (H - renderedHeight) / 2;
        return {
            left: offsetX,
            top: offsetY,
            right: offsetX + renderedWidth,
            bottom: offsetY + renderedHeight,
        };
    };

    const handleTap = (event: GestureResponderEvent) => {
        const nativeEvent = event.nativeEvent as any;
        const x = nativeEvent.locationX ?? nativeEvent.offsetX;
        const y = nativeEvent.locationY ?? nativeEvent.offsetY;
        // setPendingTap({ x, y });

        const bounds = getImageBounds();
        if (bounds && (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom)) {
            return;
        }

        const randomPlaceholder = PLACEHOLDER_OPTIONS[Math.floor(Math.random() * PLACEHOLDER_OPTIONS.length)];
        setPlaceholder(randomPlaceholder);
        setPendingTap({ x,y })

        // const { locationX, locationY } = event.nativeEvent;
        // console.log('Tapped at:', locationX, locationY);
    };

    const confirmName = () => {
        if (!pendingTap || nameInput.trim() === '') return;
        setPins((currentPins) => [...currentPins, {...pendingTap, name: nameInput.trim() }]);
        setPendingTap(null);
        setNameInput('');
    };

    const cancelTap = () => {
        setPendingTap(null);
        setNameInput('');
    };

    return (
        <View style={styles.container}>
            <Pressable onPress={handleTap} onLayout={onWrapperLayout} style={styles.imageWrapper}>
                <Image 
                source={require('../../assets/rooms/roomsample.jpeg')}
                style={styles.roomImage}
                resizeMode="contain"
                />
                {pins.map((pin, index) => (
                    <Text 
                        key={index}
                        style={[styles.pin, { left: pin.x - 12, top: pin.y - 24}]}
                    >
                        📍
                    </Text>
                ))}
            </Pressable>

            {/* autofocus puts cursor in immediately so user can type right away without having to click
            modal is the component for popups/dialogues */}
            <Modal visible={pendingTap !== null} transparent animationType="fade" >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalLabel}>"What is placed here?"</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder={`e.g. ${placeholder}`}
                            value={nameInput}
                            onChangeText={setNameInput}
                            autoFocus 
                        />
                        <View style={styles.modalButtons}>
                            <Button title="Cancel" onPress={cancelTap} />
                            <Button title="Save" onPress={confirmName} />
                        </View>
                    </View>
                </View>


            </Modal>


        </View>
    )
}

const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageWrapper: {
        width: '100%',
        height: '80%',
    },
    roomImage: {
        width: '100%',
        height: '100%',
    },
    pin: {
        position: 'absolute',
        fontSize: 24,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBox: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        gap: 12,
    },
    modalLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
});