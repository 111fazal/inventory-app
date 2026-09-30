import { useState, useEffect } from 'react';
import { GestureResponderEvent, Image, Pressable, StyleSheet, View, Text, Modal, TextInput, Button, LayoutChangeEvent } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const roomImageSource = require('../../assets/rooms/roomsample.jpeg');
const roomImageInfo = Image.resolveAssetSource(roomImageSource);

const PLACEHOLDER_OPTIONS = ['hammer', 'screwdriver', 'wrench', 'pliers', 'baskets', 'tape measure', 'calligraphy pen', 'alarm clock', 'thumbtacks', 'hangers'];

const STORAGE_KEY = 'pins';


type Pin = { x: number; y: number; name: string };

export default function HomeScreen() {
    const [pins, setPins] = useState<Pin[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [pendingTap, setPendingTap] = useState<{ x: number; y: number; } | null>(null);
    const [nameInput, setNameInput] = useState('');
    const [placeholder, setPlaceholder] = useState('e.g screwdriver');
    const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 });
    const [selectedPinIndex, setSelectedPinIndex] = useState<number | null>(null);

    // Load the saved pins when the app first starts (if any)
    useEffect(() => {
        const loadPins = async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved) {
                    setPins(JSON.parse(saved));
                }
            } catch (error) {
                console.error('Failed to load pins', error);
            } finally {
                setIsLoaded(true);
            }
        };
        loadPins();
    }, []);

    // When the pin array changes, save pins to storage 
    useEffect(() => {
        if (!isLoaded) return;
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pins)).catch((error) => {
            console.error('Failed to save pins', error);
        });
    }, [pins, isLoaded]);

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

    const openPin = (index: number) => {
        setSelectedPinIndex(index);
    };

    const closePinDetail = () => {
        setSelectedPinIndex(null);
    };

    const deleteSelectedPin = () => {
        if (selectedPinIndex === null) return;
        setPins((currentPins) => currentPins.filter((_, i) => i !== selectedPinIndex));
        setSelectedPinIndex(null);
    }

    return (
        <View style={styles.container}>
            <Pressable onPress={handleTap} onLayout={onWrapperLayout} style={styles.imageWrapper}>
                <Image 
                source={require('../../assets/rooms/roomsample.jpeg')}
                style={styles.roomImage}
                resizeMode="contain"
                />
                {pins.map((pin, index) => (
                    <Pressable 
                        key={index}
                        onPress={() => openPin(index)}
                        style={[styles.pin, { left: pin.x - 12, top: pin.y - 24}]}
                    >
                        <Text style={styles.pinEmoji}>📍</Text>
                    </Pressable>
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

            <Modal visible={selectedPinIndex !== null} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalLabel}>
                            {selectedPinIndex !== null ? pins[selectedPinIndex].name : ''}
                        </Text>
                        <View style={styles.modalButtons}>
                            <Button title="Close" onPress={closePinDetail} />
                            <Button title="Delete" color="#d32f2f" onPress={deleteSelectedPin} />
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
    },
    pinEmoji: {
        fontSize: 24,
        padding: 6,

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