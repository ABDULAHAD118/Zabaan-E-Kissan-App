import React, {useState} from "react";
import {
    ScrollView,
    TouchableOpacity,
    View,
    Image,
    Alert,
    Modal,
    StyleSheet, StatusBar
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import {ThemedText} from "@/components/ThemedText";
import {useColorScheme} from "@/hooks/useColorScheme";
import {Ionicons, Entypo, MaterialIcons} from "@expo/vector-icons";
import {useTranslation} from "react-i18next";
import {
    getContainerStyle,
    getHeaderStyle,
    getSectionStyle,
    getCardStyle,
    getTextStyle,
    getColor,
    getSpacing
} from "@/utils/styles";

export default function DiseaseDetectionScreen() {
    const colorScheme = useColorScheme() ?? "light";
    const {t} = useTranslation();

    // State for image handling
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showActionSheet, setShowActionSheet] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Request media library permissions
    const requestMediaLibraryPermission = async () => {
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        return status === 'granted';
    };

    const openCamera = async () => {
        const {status} = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(t('home.permissionRequired'), t('home.cameraPermissionMessage'));
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setSelectedImage(result.assets[0].uri);
            setShowImageModal(true);
            setShowActionSheet(false);
        }
    };


    // Open gallery to select image
    const openGallery = async () => {
        try {
            const hasPermission = await requestMediaLibraryPermission();
            if (!hasPermission) {
                Alert.alert(t('home.permissionRequired'), t('home.mediaPermissionMessage'));
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedImage(result.assets[0].uri);
                setShowImageModal(true);
                setShowActionSheet(false);
            }
        } catch {
            Alert.alert(t('common.error'), t('home.errorMessage'));
        }
    };

    // Show action sheet for image source selection
    const showImageSourceActionSheet = () => {
        setShowActionSheet(true);
    };

    // Analyze the selected image
    const analyzeImage = async () => {
        if (!selectedImage) return;

        setIsAnalyzing(true);
        setShowImageModal(false);

        // Simulate analysis delay
        setTimeout(() => {
            setIsAnalyzing(false);
            Alert.alert(
                t('home.analysisComplete'),
                t('home.analysisCompleteMessage'),
                [
                    {text: t('common.ok'), onPress: () => setSelectedImage(null)}
                ]
            );
        }, 3000);
    };

    // Handle upload button press
    const handleUpload = () => {
        showImageSourceActionSheet();
    };

    // Handle quick action button press
    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'Camera':
                openCamera();
                break;
            case 'Gallery':
                openGallery();
                break;
            default:
                Alert.alert(t('common.quickAction'), `${action} ${t('common.comingSoon')}`);
        }
    };

    const recentScans = [
        {id: 1, crop: "Wheat", status: "Healthy", date: "2 hours ago", confidence: 95},
        {id: 2, crop: "Rice", status: "Disease Detected", date: "1 day ago", confidence: 87},
        {id: 3, crop: "Corn", status: "Healthy", date: "3 days ago", confidence: 92},
    ];

    const commonDiseases = [
        {name: "Leaf Blight", severity: "High", crop: "Wheat", description: "Fungal disease affecting leaves"},
        {name: "Root Rot", severity: "Medium", crop: "Rice", description: "Soil-borne disease affecting roots"},
        {name: "Powdery Mildew", severity: "Low", crop: "Corn", description: "Fungal disease with white powdery spots"},
    ];

    return (

        <View style={[getContainerStyle(colorScheme), {flex: 1}]}>
            <StatusBar
                barStyle={colorScheme === 'dark' ? 'light-content' : 'light-content'}
                backgroundColor={getColor(colorScheme, 'primary')}
            />
            {/* Header */}
            <View style={[getHeaderStyle(colorScheme), {paddingVertical: getSpacing('xs')}]}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: getSpacing('sm')
                }}>
                    <View style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: getColor(colorScheme, 'highlight'),
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: getSpacing('sm')
                    }}>
                        <Entypo name="leaf" size={18} color={getColor(colorScheme, 'primary')}/>
                    </View>
                    <View style={{flex: 1}}>
                        <ThemedText style={{
                            ...getTextStyle(colorScheme, 'title'),
                            fontSize: 30,
                            fontWeight: '600'
                        }}>
                            {t('home.title')}
                        </ThemedText>
                    </View>
                </View>
            </View>
            <ScrollView
                style={getContainerStyle(colorScheme)}
                showsVerticalScrollIndicator={false}
            >
                {/* Upload Section */}
                <View style={getSectionStyle(colorScheme)}>
                    <TouchableOpacity
                        style={{
                            borderWidth: 2,
                            borderStyle: 'dashed',
                            borderColor: getColor(colorScheme, 'outline'),
                            borderRadius: 16,
                            padding: getSpacing('xl'),
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: getColor(colorScheme, 'surfaceVariant'),
                            marginBottom: getSpacing('lg')
                        }}
                        onPress={handleUpload}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="camera"
                            size={48}
                            color={getColor(colorScheme, 'primary')}
                        />
                        <ThemedText style={{
                            ...getTextStyle(colorScheme, 'heading'),
                            marginTop: getSpacing('md'),
                            marginBottom: getSpacing('sm'),
                            color: getColor(colorScheme, 'text')
                        }}>
                            {t('home.uploadTitle')}
                        </ThemedText>
                        <ThemedText style={{
                            ...getTextStyle(colorScheme, 'body'),
                            textAlign: 'center',
                            color: getColor(colorScheme, 'textSecondary')
                        }}>
                            {t('home.uploadDescription')}
                        </ThemedText>
                    </TouchableOpacity>

                    {/* Quick Actions */}
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: getSpacing('lg')
                    }}>
                        {[
                            {
                                icon: 'camera',
                                title: t('home.camera'),
                                action: 'Camera',
                                color: getColor(colorScheme, 'primary')
                            },
                            {
                                icon: 'images',
                                title: t('home.gallery'),
                                action: 'Gallery',
                                color: getColor(colorScheme, 'secondary')
                            },
                        ].map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={{
                                    flex: 1,
                                    marginHorizontal: index === 1 ? getSpacing('sm') : 0,
                                    padding: getSpacing('md'),
                                    borderRadius: 12,
                                    backgroundColor: getColor(colorScheme, 'surface'),
                                    borderWidth: 1,
                                    borderColor: getColor(colorScheme, 'outline'),
                                    alignItems: 'center'
                                }}
                                onPress={() => handleQuickAction(item.action)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name={item.icon as any} size={24} color={item.color}/>
                                <ThemedText style={{
                                    ...getTextStyle(colorScheme, 'caption'),
                                    marginTop: getSpacing('xs'),
                                    color: getColor(colorScheme, 'text')
                                }}>
                                    {item.title}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Content */}
                {/* Recent Scans */}
                <View style={[getCardStyle(colorScheme), {marginHorizontal: getSpacing('md')}]}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: getSpacing('md')
                    }}>
                        <MaterialIcons name="history" size={20} color={getColor(colorScheme, 'primary')}/>
                        <ThemedText style={{
                            ...getTextStyle(colorScheme, 'heading'),
                            marginLeft: getSpacing('sm'),
                            color: getColor(colorScheme, 'text')
                        }}>
                            {t('home.recentScans')}
                        </ThemedText>
                    </View>

                    {recentScans.map((scan) => (
                        <View
                            key={scan.id}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: getSpacing('sm'),
                                borderBottomWidth: 1,
                                borderBottomColor: getColor(colorScheme, 'outline'),
                                marginBottom: getSpacing('sm')
                            }}
                        >
                            <View style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: scan.status === 'Healthy'
                                    ? getColor(colorScheme, 'success')
                                    : getColor(colorScheme, 'warning'),
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: getSpacing('md')
                            }}>
                                <Ionicons
                                    name={scan.status === 'Healthy' ? 'checkmark' : 'warning'}
                                    size={20}
                                    color={getColor(colorScheme, 'buttonText')}
                                />
                            </View>

                            <View style={{flex: 1}}>
                                <ThemedText style={{
                                    ...getTextStyle(colorScheme, 'body'),
                                    fontWeight: '600',
                                    color: getColor(colorScheme, 'text')
                                }}>
                                    {scan.crop}
                                </ThemedText>
                                <ThemedText style={{
                                    ...getTextStyle(colorScheme, 'caption'),
                                    color: getColor(colorScheme, 'textSecondary')
                                }}>
                                    {scan.status === 'Healthy' ? t('home.healthy') : t('home.diseaseDetected')} • {scan.date}
                                </ThemedText>
                            </View>

                            <View style={{
                                paddingHorizontal: getSpacing('sm'),
                                paddingVertical: getSpacing('xs'),
                                borderRadius: 8,
                                backgroundColor: getColor(colorScheme, 'highlight')
                            }}>
                                <ThemedText style={{
                                    fontSize: 12,
                                    fontWeight: '600',
                                    color: getColor(colorScheme, 'primary')
                                }}>
                                    {scan.confidence}%
                                </ThemedText>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Common Diseases */}
                <View style={[getCardStyle(colorScheme), {marginHorizontal: getSpacing('md')}]}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: getSpacing('md')
                    }}>
                        <MaterialIcons name="warning" size={20} color={getColor(colorScheme, 'warning')}/>
                        <ThemedText style={{
                            ...getTextStyle(colorScheme, 'heading'),
                            marginLeft: getSpacing('sm'),
                            color: getColor(colorScheme, 'text')
                        }}>
                            {t('home.commonDiseases')}
                        </ThemedText>
                    </View>

                    {commonDiseases.map((disease, index) => (
                        <View
                            key={index}
                            style={{
                                padding: getSpacing('md'),
                                borderRadius: 12,
                                backgroundColor: getColor(colorScheme, 'surfaceVariant'),
                                marginBottom: getSpacing('sm'),
                                borderLeftWidth: 4,
                                borderLeftColor: disease.severity === 'High'
                                    ? getColor(colorScheme, 'error')
                                    : disease.severity === 'Medium'
                                        ? getColor(colorScheme, 'warning')
                                        : getColor(colorScheme, 'success')
                            }}
                        >
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: getSpacing('xs')
                            }}>
                                <ThemedText style={{
                                    ...getTextStyle(colorScheme, 'body'),
                                    fontWeight: '600',
                                    color: getColor(colorScheme, 'text')
                                }}>
                                    {disease.name}
                                </ThemedText>
                                <View style={{
                                    paddingHorizontal: getSpacing('sm'),
                                    paddingVertical: getSpacing('xs'),
                                    borderRadius: 12,
                                    backgroundColor: disease.severity === 'High'
                                        ? getColor(colorScheme, 'error')
                                        : disease.severity === 'Medium'
                                            ? getColor(colorScheme, 'warning')
                                            : getColor(colorScheme, 'success')
                                }}>
                                    <ThemedText style={{
                                        fontSize: 12,
                                        fontWeight: '600',
                                        color: getColor(colorScheme, 'buttonText')
                                    }}>
                                        {disease.severity}
                                    </ThemedText>
                                </View>
                            </View>

                            <ThemedText style={{
                                ...getTextStyle(colorScheme, 'caption'),
                                color: getColor(colorScheme, 'textSecondary'),
                                marginBottom: getSpacing('xs')
                            }}>
                                {disease.crop}
                            </ThemedText>

                            <ThemedText style={{
                                ...getTextStyle(colorScheme, 'caption'),
                                color: getColor(colorScheme, 'textTertiary')
                            }}>
                                {disease.description}
                            </ThemedText>
                        </View>
                    ))}
                </View>

                {/* Tips Section */}
                <View style={[getCardStyle(colorScheme), {marginHorizontal: getSpacing('md')}]}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: getSpacing('md')
                    }}>
                        <MaterialIcons name="lightbulb" size={20} color={getColor(colorScheme, 'accent')}/>
                        <ThemedText style={{
                            ...getTextStyle(colorScheme, 'heading'),
                            marginLeft: getSpacing('sm'),
                            color: getColor(colorScheme, 'text')
                        }}>
                            Pro Tips
                        </ThemedText>
                    </View>

                    <View style={{
                        padding: getSpacing('md'),
                        borderRadius: 12,
                        backgroundColor: getColor(colorScheme, 'highlight'),
                        borderWidth: 1,
                        borderColor: getColor(colorScheme, 'primary')
                    }}>
                        <ThemedText style={{
                            ...getTextStyle(colorScheme, 'body'),
                            color: getColor(colorScheme, 'primary'),
                            textAlign: 'justify',
                            lineHeight: 24
                        }}>
                            • Take photos in good lighting for better accuracy{'\n'}
                            • Include both healthy and affected areas{'\n'}
                            • Scan regularly to catch issues early{'\n'}
                            • Keep your camera lens clean
                        </ThemedText>
                    </View>
                </View>


                {/* Action Sheet Modal */}
                <Modal
                    visible={showActionSheet}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowActionSheet(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.actionSheet, {backgroundColor: getColor(colorScheme, 'surface')}]}>
                            <View style={styles.actionSheetHeader}>
                                <ThemedText style={[styles.actionSheetTitle, {color: getColor(colorScheme, 'text')}]}>
                                    Select Image Source
                                </ThemedText>
                                <TouchableOpacity onPress={() => setShowActionSheet(false)}>
                                    <Ionicons name="close" size={24} color={getColor(colorScheme, 'outline')}/>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.actionSheetItem, {borderBottomColor: getColor(colorScheme, 'outline')}]}
                                onPress={openCamera}
                            >
                                <Ionicons name="camera" size={24} color={getColor(colorScheme, 'primary')}/>
                                <ThemedText
                                    style={[styles.actionSheetItemText, {color: getColor(colorScheme, 'text')}]}>
                                    Take Photo
                                </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionSheetItem, {borderBottomColor: getColor(colorScheme, 'outline')}]}
                                onPress={openGallery}
                            >
                                <Ionicons name="images" size={24} color={getColor(colorScheme, 'primary')}/>
                                <ThemedText
                                    style={[styles.actionSheetItemText, {color: getColor(colorScheme, 'text')}]}>
                                    Choose from Gallery
                                </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionSheetItem}
                                onPress={() => setShowActionSheet(false)}
                            >
                                <ThemedText
                                    style={[styles.actionSheetCancelText, {color: getColor(colorScheme, 'error')}]}>
                                    Cancel
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Image Preview Modal */}
                <Modal
                    visible={showImageModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowImageModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.imageModal, {backgroundColor: getColor(colorScheme, 'surface')}]}>
                            <View style={styles.imageModalHeader}>
                                <ThemedText style={[styles.imageModalTitle, {color: getColor(colorScheme, 'text')}]}>
                                    Crop Image Preview
                                </ThemedText>
                                <TouchableOpacity onPress={() => setShowImageModal(false)}>
                                    <Ionicons name="close" size={24} color={getColor(colorScheme, 'outline')}/>
                                </TouchableOpacity>
                            </View>

                            {selectedImage && (
                                <Image source={{uri: selectedImage}} style={styles.previewImage}/>
                            )}

                            <View style={styles.imageModalActions}>
                                <TouchableOpacity
                                    style={[styles.actionButton, {backgroundColor: getColor(colorScheme, 'error')}]}
                                    onPress={() => setShowImageModal(false)}
                                >
                                    <ThemedText
                                        style={[styles.actionButtonText, {color: getColor(colorScheme, 'buttonText')}]}>
                                        Cancel
                                    </ThemedText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, {backgroundColor: getColor(colorScheme, 'primary')}]}
                                    onPress={analyzeImage}
                                >
                                    <ThemedText
                                        style={[styles.actionButtonText, {color: getColor(colorScheme, 'buttonText')}]}>
                                        Analyze Image
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Analysis Loading Modal */}
                <Modal
                    visible={isAnalyzing}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.loadingModal, {backgroundColor: getColor(colorScheme, 'surface')}]}>
                            <View style={[styles.loadingSpinner, {borderColor: getColor(colorScheme, 'primary')}]}/>
                            <ThemedText style={[styles.loadingText, {color: getColor(colorScheme, 'text')}]}>
                                Analyzing crop image...
                            </ThemedText>
                            <ThemedText style={[styles.loadingSubtext, {color: getColor(colorScheme, 'outline')}]}>
                                Please wait while we detect diseases
                            </ThemedText>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    actionSheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 34,
    },
    actionSheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    actionSheetTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    actionSheetItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    actionSheetItemText: {
        fontSize: 16,
        marginLeft: 16,
    },
    actionSheetCancelText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    imageModal: {
        margin: 20,
        borderRadius: 16,
        maxHeight: '80%',
    },
    imageModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    imageModalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    previewImage: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
    },
    imageModalActions: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    loadingModal: {
        margin: 40,
        padding: 40,
        borderRadius: 16,
        alignItems: 'center',
    },
    loadingSpinner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 4,
        borderTopColor: 'transparent',
        marginBottom: 20,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    loadingSubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
});

