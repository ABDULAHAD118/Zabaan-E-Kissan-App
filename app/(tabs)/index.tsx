import React, {useState, useEffect} from "react";
import {
    ScrollView,
    TouchableOpacity,
    View,
    Image,
    Alert,
    Modal,
    StatusBar,
    ActivityIndicator,
    StyleSheet
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import {ThemedText} from "@/components/ThemedText";
import {useColorScheme} from "@/hooks/useColorScheme";
import {Ionicons, Entypo, MaterialIcons} from "@expo/vector-icons";
import {useTranslation} from "react-i18next";
import {useMutation} from '@tanstack/react-query';
import {useRouter} from 'expo-router';
import {
    getContainerStyle,
    getHeaderStyle,
    getSectionStyle,
    getCardStyle,
    getTextStyle,
    getColor,
    getSpacing
} from "@/utils/styles";
import {detectDisease, DiseaseScanResult} from "@/hooks/useApi";
import {getRecentScans, saveRecentScan} from "@/utils/storage";
import {generateUUID} from "@/utils/uuid";

export default function DiseaseDetectionScreen() {
    const colorScheme = useColorScheme() ?? "light";
    const {t, i18n} = useTranslation();
    const router = useRouter();

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showActionSheet, setShowActionSheet] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [detectionResult, setDetectionResult] = useState<DiseaseScanResult | null>(null);
    const [recentScans, setRecentScans] = useState<DiseaseScanResult[]>([]);

    useEffect(() => {
        loadRecentScans();
    }, []);

    const loadRecentScans = async () => {
        const scans = await getRecentScans();
        setRecentScans(scans);
    };

    const detectMutation = useMutation({
        mutationFn: detectDisease,
        onSuccess: async (data) => {
            const scanResult: DiseaseScanResult = {
                ...data,
                id: generateUUID(),
                timestamp: new Date().toISOString(),
                imageUri: selectedImage || '',
            };

            await saveRecentScan(scanResult);
            await loadRecentScans();

            setDetectionResult(scanResult);
            setShowResultModal(true);
        },
        onError: (error) => {
            console.error('Detection error:', error);
            // Get fresh translation on error
            const errorTitle = i18n.t('home.detectionFailed');
            const errorMsg = i18n.t('home.detectionFailedMessage');
            Alert.alert(errorTitle, errorMsg);
        },
    });

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

    const analyzeImage = async () => {
        if (!selectedImage) return;
        setShowImageModal(false);
        detectMutation.mutate(selectedImage);
    };

    const viewRecentScanDetail = (scan: DiseaseScanResult) => {
        router.push({
            pathname: '/scan-detail',
            params: {
                scan: encodeURIComponent(JSON.stringify(scan))
            }
        });
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
        else if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        else return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    };

    const getSupportedCrops = () => [t('home.potato'), t('home.sugarcane'), t('home.rice'), t('home.wheat'), t('home.corn')];

    return (
        <View style={[getContainerStyle(colorScheme), {flex: 1}]}>
            <StatusBar barStyle="light-content" backgroundColor={getColor(colorScheme, 'primary')} />

            <View style={[getHeaderStyle(colorScheme), {paddingVertical: getSpacing('xs')}]}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: getSpacing('sm')}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                        <View style={{width: 36, height: 36, borderRadius: 18, backgroundColor: getColor(colorScheme, 'highlight'), alignItems: 'center', justifyContent: 'center', marginRight: getSpacing('sm')}}>
                            <Entypo name="leaf" size={18} color={getColor(colorScheme, 'primary')}/>
                        </View>
                        <View style={{flex: 1}}>
                            <ThemedText style={{...getTextStyle(colorScheme, 'title'), fontSize: 30, fontWeight: '600'}}>
                                {t('home.title')}
                            </ThemedText>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView style={getContainerStyle(colorScheme)} showsVerticalScrollIndicator={false}>
                <View style={getSectionStyle(colorScheme)}>
                    <TouchableOpacity style={{borderWidth: 2, borderStyle: 'dashed', borderColor: getColor(colorScheme, 'outline'), borderRadius: 16, padding: getSpacing('xl'), alignItems: 'center', justifyContent: 'center', backgroundColor: getColor(colorScheme, 'surfaceVariant'), marginBottom: getSpacing('lg')}} onPress={() => setShowActionSheet(true)} activeOpacity={0.7}>
                        <Ionicons name="camera" size={48} color={getColor(colorScheme, 'primary')} />
                        <ThemedText style={{...getTextStyle(colorScheme, 'heading'), marginTop: getSpacing('md'), marginBottom: getSpacing('sm'), color: getColor(colorScheme, 'text')}}>
                            {t('home.uploadTitle')}
                        </ThemedText>
                        <ThemedText style={{...getTextStyle(colorScheme, 'body'), textAlign: 'center', color: getColor(colorScheme, 'textSecondary')}}>
                            {t('home.uploadDescription')}
                        </ThemedText>
                    </TouchableOpacity>

                    <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: getSpacing('lg')}}>
                        {[{icon: 'camera', title: t('home.camera'), action: 'Camera', color: getColor(colorScheme, 'primary')}, {icon: 'images', title: t('home.gallery'), action: 'Gallery', color: getColor(colorScheme, 'secondary')}].map((item, index) => (
                            <TouchableOpacity key={index} style={{flex: 1, marginHorizontal: index === 1 ? getSpacing('sm') : 0, padding: getSpacing('md'), borderRadius: 12, backgroundColor: getColor(colorScheme, 'surface'), borderWidth: 1, borderColor: getColor(colorScheme, 'outline'), alignItems: 'center'}} onPress={() => item.action === 'Camera' ? openCamera() : openGallery()} activeOpacity={0.7}>
                                <Ionicons name={item.icon as any} size={24} color={item.color}/>
                                <ThemedText style={{...getTextStyle(colorScheme, 'caption'), marginTop: getSpacing('xs'), color: getColor(colorScheme, 'text')}}>{item.title}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={[getCardStyle(colorScheme), {marginHorizontal: getSpacing('md')}]}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: getSpacing('md')}}>
                        <MaterialIcons name="history" size={20} color={getColor(colorScheme, 'primary')}/>
                        <ThemedText style={{...getTextStyle(colorScheme, 'heading'), marginLeft: getSpacing('sm'), color: getColor(colorScheme, 'text')}}>{t('home.recentScans')}</ThemedText>
                    </View>

                    {recentScans.length === 0 ? (
                        <View style={{padding: getSpacing('lg'), alignItems: 'center'}}>
                            <ThemedText style={{...getTextStyle(colorScheme, 'body'), color: getColor(colorScheme, 'textSecondary'), textAlign: 'center', marginBottom: getSpacing('sm')}}>{t('home.noRecentScans')}</ThemedText>
                            <ThemedText style={{...getTextStyle(colorScheme, 'caption'), color: getColor(colorScheme, 'textTertiary'), textAlign: 'center'}}>{t('home.scanNowMessage')}</ThemedText>
                        </View>
                    ) : (
                        recentScans.map((scan) => (
                            <TouchableOpacity key={scan.id} style={{flexDirection: 'row', alignItems: 'center', paddingVertical: getSpacing('sm'), borderBottomWidth: 1, borderBottomColor: getColor(colorScheme, 'outline'), marginBottom: getSpacing('sm')}} onPress={() => viewRecentScanDetail(scan)} activeOpacity={0.7}>
                                <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: scan.is_healthy ? getColor(colorScheme, 'success') : getColor(colorScheme, 'warning'), alignItems: 'center', justifyContent: 'center', marginRight: getSpacing('md')}}>
                                    <Ionicons name={scan.is_healthy ? 'checkmark' : 'warning'} size={20} color={getColor(colorScheme, 'buttonText')} />
                                </View>
                                <View style={{flex: 1}}>
                                    <ThemedText style={{...getTextStyle(colorScheme, 'body'), fontWeight: '600', color: getColor(colorScheme, 'text')}}>{scan.predicted_class.replace(/_/g, ' ')}</ThemedText>
                                    <ThemedText style={{...getTextStyle(colorScheme, 'caption'), color: getColor(colorScheme, 'textSecondary')}}>{scan.is_healthy ? t('home.healthy') : t('home.diseaseDetected')} • {formatTimestamp(scan.timestamp)}</ThemedText>
                                </View>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <View style={{paddingHorizontal: getSpacing('sm'), paddingVertical: getSpacing('xs'), borderRadius: 8, backgroundColor: getColor(colorScheme, 'highlight'), marginRight: getSpacing('sm')}}>
                                        <ThemedText style={{fontSize: 12, fontWeight: '600', color: getColor(colorScheme, 'primary')}}>{scan.confidence_percent.toFixed(0)}%</ThemedText>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={getColor(colorScheme, 'outline')} />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                <View style={[getCardStyle(colorScheme), {marginHorizontal: getSpacing('md')}]}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: getSpacing('md')}}>
                        <MaterialIcons name="eco" size={20} color={getColor(colorScheme, 'accent')}/>
                        <ThemedText style={{...getTextStyle(colorScheme, 'heading'), marginLeft: getSpacing('sm'), color: getColor(colorScheme, 'text')}}>{t('home.supportedCrops')}</ThemedText>
                    </View>
                    <ThemedText style={{...getTextStyle(colorScheme, 'body'), color: getColor(colorScheme, 'textSecondary'), marginBottom: getSpacing('md')}}>{t('home.supportedCropsMessage')}</ThemedText>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: getSpacing('sm')}}>
                        {getSupportedCrops().map((crop, index) => (
                            <View key={index} style={{paddingHorizontal: getSpacing('md'), paddingVertical: getSpacing('sm'), borderRadius: 20, backgroundColor: getColor(colorScheme, 'highlight'), borderWidth: 1, borderColor: getColor(colorScheme, 'primary')}}>
                                <ThemedText style={{...getTextStyle(colorScheme, 'body'), color: getColor(colorScheme, 'primary'), fontWeight: '600'}}>{crop}</ThemedText>
                            </View>
                        ))}
                    </View>
                </View>

                <Modal visible={showActionSheet} transparent animationType="slide" onRequestClose={() => setShowActionSheet(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.actionSheet, {backgroundColor: getColor(colorScheme, 'surface')}]}>
                            <View style={styles.actionSheetHeader}>
                                <ThemedText style={[styles.actionSheetTitle, {color: getColor(colorScheme, 'text')}]}>{t('home.selectImageSource')}</ThemedText>
                                <TouchableOpacity onPress={() => setShowActionSheet(false)}><Ionicons name="close" size={24} color={getColor(colorScheme, 'outline')}/></TouchableOpacity>
                            </View>
                            <TouchableOpacity style={[styles.actionSheetItem, {borderBottomColor: getColor(colorScheme, 'outline')}]} onPress={openCamera}>
                                <Ionicons name="camera" size={24} color={getColor(colorScheme, 'primary')}/>
                                <ThemedText style={[styles.actionSheetItemText, {color: getColor(colorScheme, 'text')}]}>{t('home.takePhoto')}</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionSheetItem, {borderBottomColor: getColor(colorScheme, 'outline')}]} onPress={openGallery}>
                                <Ionicons name="images" size={24} color={getColor(colorScheme, 'primary')}/>
                                <ThemedText style={[styles.actionSheetItemText, {color: getColor(colorScheme, 'text')}]}>{t('home.chooseFromGallery')}</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionSheetItem} onPress={() => setShowActionSheet(false)}>
                                <ThemedText style={[styles.actionSheetCancelText, {color: getColor(colorScheme, 'error')}]}>{t('common.cancel')}</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Modal visible={showImageModal} transparent animationType="fade" onRequestClose={() => setShowImageModal(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.imageModal, {backgroundColor: getColor(colorScheme, 'surface')}]}>
                            <View style={styles.imageModalHeader}>
                                <ThemedText style={[styles.imageModalTitle, {color: getColor(colorScheme, 'text')}]}>{t('home.cropImagePreview')}</ThemedText>
                                <TouchableOpacity onPress={() => setShowImageModal(false)}><Ionicons name="close" size={24} color={getColor(colorScheme, 'outline')}/></TouchableOpacity>
                            </View>
                            {selectedImage && <Image source={{uri: selectedImage}} style={styles.previewImage}/>}
                            <View style={styles.imageModalActions}>
                                <TouchableOpacity style={[styles.actionButton, {backgroundColor: getColor(colorScheme, 'error')}]} onPress={() => setShowImageModal(false)}>
                                    <ThemedText style={[styles.actionButtonText, {color: getColor(colorScheme, 'buttonText')}]}>{t('common.cancel')}</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionButton, {backgroundColor: getColor(colorScheme, 'primary')}]} onPress={analyzeImage}>
                                    <ThemedText style={[styles.actionButtonText, {color: getColor(colorScheme, 'buttonText')}]}>{t('home.analyzeImage')}</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Modal visible={detectMutation.isPending} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.loadingModal, {backgroundColor: getColor(colorScheme, 'surface')}]}>
                            <ActivityIndicator size="large" color={getColor(colorScheme, 'primary')}/>
                            <ThemedText style={[styles.loadingText, {color: getColor(colorScheme, 'text')}]}>{t('home.analyzingCropImage')}</ThemedText>
                            <ThemedText style={[styles.loadingSubtext, {color: getColor(colorScheme, 'outline')}]}>{t('home.pleaseWait')}</ThemedText>
                        </View>
                    </View>
                </Modal>

                <Modal visible={showResultModal} transparent animationType="slide" onRequestClose={() => setShowResultModal(false)}>
                    <View style={styles.modalOverlay}>
                        <ScrollView style={{flex: 1}} contentContainerStyle={{justifyContent: 'flex-end', minHeight: '100%'}}>
                            <View style={[styles.resultModal, {backgroundColor: getColor(colorScheme, 'surface')}]}>
                                <View style={styles.resultModalHeader}>
                                    <ThemedText style={[styles.resultModalTitle, {color: getColor(colorScheme, 'text')}]}>{t('home.detectionResult')}</ThemedText>
                                    <TouchableOpacity onPress={() => {setShowResultModal(false); setSelectedImage(null);}}>
                                        <Ionicons name="close" size={24} color={getColor(colorScheme, 'outline')}/>
                                    </TouchableOpacity>
                                </View>

                                {detectionResult && (
                                    <View style={{padding: getSpacing('md')}}>
                                        {detectionResult.imageUri && <Image source={{uri: detectionResult.imageUri}} style={{width: '100%', height: 200, borderRadius: 12, marginBottom: getSpacing('md')}} />}

                                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: getSpacing('lg')}}>
                                            <View style={{flex: 1, padding: getSpacing('md'), borderRadius: 12, backgroundColor: detectionResult.is_healthy ? getColor(colorScheme, 'success') : getColor(colorScheme, 'warning')}}>
                                                <ThemedText style={{fontSize: 24, fontWeight: 'bold', color: getColor(colorScheme, 'buttonText'), textAlign: 'center'}}>{detectionResult.status}</ThemedText>
                                            </View>
                                        </View>

                                        <View style={{marginBottom: getSpacing('md')}}>
                                            <ThemedText style={{...getTextStyle(colorScheme, 'caption'), color: getColor(colorScheme, 'textSecondary'), marginBottom: getSpacing('xs')}}>Detected Disease</ThemedText>
                                            <ThemedText style={{...getTextStyle(colorScheme, 'heading'), color: getColor(colorScheme, 'text')}}>{detectionResult.predicted_class.replace(/_/g, ' ')}</ThemedText>
                                        </View>

                                        <View style={{marginBottom: getSpacing('md')}}>
                                            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: getSpacing('xs')}}>
                                                <ThemedText style={{...getTextStyle(colorScheme, 'caption'), color: getColor(colorScheme, 'textSecondary')}}>{t('home.confidenceLevel')}</ThemedText>
                                                <ThemedText style={{...getTextStyle(colorScheme, 'body'), fontWeight: '600', color: getColor(colorScheme, 'primary')}}>{detectionResult.confidence_percent.toFixed(2)}%</ThemedText>
                                            </View>
                                            <View style={{height: 8, backgroundColor: getColor(colorScheme, 'outline'), borderRadius: 4, overflow: 'hidden'}}>
                                                <View style={{height: '100%', width: `${detectionResult.confidence_percent}%`, backgroundColor: getColor(colorScheme, 'primary')}}/>
                                            </View>
                                        </View>

                                        {!detectionResult.is_healthy && (
                                            <View style={{marginBottom: getSpacing('md')}}>
                                                <ThemedText style={{...getTextStyle(colorScheme, 'caption'), color: getColor(colorScheme, 'textSecondary'), marginBottom: getSpacing('xs')}}>{t('home.severityRange')}</ThemedText>
                                                <ThemedText style={{...getTextStyle(colorScheme, 'body'), color: getColor(colorScheme, 'text')}}>{detectionResult.severity_range}</ThemedText>
                                            </View>
                                        )}

                                        <View style={{marginBottom: getSpacing('md')}}>
                                            <ThemedText style={{...getTextStyle(colorScheme, 'caption'), color: getColor(colorScheme, 'textSecondary'), marginBottom: getSpacing('xs')}}>{t('home.description')}</ThemedText>
                                            <ThemedText style={{...getTextStyle(colorScheme, 'body'), color: getColor(colorScheme, 'text'), lineHeight: 22}}>{i18n.language === 'ur' ? detectionResult.description_ur : detectionResult.description}</ThemedText>
                                        </View>

                                        {!detectionResult.is_healthy && (
                                            <View style={{padding: getSpacing('md'), borderRadius: 12, backgroundColor: getColor(colorScheme, 'highlight'), borderWidth: 1, borderColor: getColor(colorScheme, 'primary'), marginBottom: getSpacing('md')}}>
                                                <ThemedText style={{...getTextStyle(colorScheme, 'caption'), color: getColor(colorScheme, 'primary'), marginBottom: getSpacing('xs'), fontWeight: '600'}}>{t('home.recommendedAction')}</ThemedText>
                                                <ThemedText style={{...getTextStyle(colorScheme, 'body'), color: getColor(colorScheme, 'primary'), lineHeight: 22}}>{i18n.language === 'ur' ? detectionResult.recommended_action_ur : detectionResult.recommended_action}</ThemedText>
                                            </View>
                                        )}

                                        <View style={{marginBottom: getSpacing('md')}}>
                                            <ThemedText style={{...getTextStyle(colorScheme, 'heading'), color: getColor(colorScheme, 'text'), marginBottom: getSpacing('sm')}}>{t('home.topPredictions')}</ThemedText>
                                            {detectionResult.top_3_predictions.map((pred, index) => (
                                                <View key={index} style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: getSpacing('sm'), borderBottomWidth: index < 2 ? 1 : 0, borderBottomColor: getColor(colorScheme, 'outline')}}>
                                                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                                                        <View style={{width: 24, height: 24, borderRadius: 12, backgroundColor: index === 0 ? getColor(colorScheme, 'primary') : getColor(colorScheme, 'outline'), alignItems: 'center', justifyContent: 'center', marginRight: getSpacing('sm')}}>
                                                            <ThemedText style={{fontSize: 12, fontWeight: '600', color: getColor(colorScheme, 'buttonText')}}>{index + 1}</ThemedText>
                                                        </View>
                                                        <ThemedText style={{...getTextStyle(colorScheme, 'body'), color: getColor(colorScheme, 'text'), flex: 1}}>{pred.class_name.replace(/_/g, ' ')}</ThemedText>
                                                    </View>
                                                    <ThemedText style={{...getTextStyle(colorScheme, 'body'), fontWeight: '600', color: getColor(colorScheme, 'primary')}}>{pred.confidence.toFixed(2)}%</ThemedText>
                                                </View>
                                            ))}
                                        </View>

                                        <TouchableOpacity style={{backgroundColor: getColor(colorScheme, 'primary'), padding: getSpacing('md'), borderRadius: 12, alignItems: 'center'}} onPress={() => {setShowResultModal(false); setSelectedImage(null);}}>
                                            <ThemedText style={{...getTextStyle(colorScheme, 'body'), fontWeight: '600', color: getColor(colorScheme, 'buttonText')}}>{t('home.close')}</ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
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
        justifyContent: 'flex-end' as const,
    },
    actionSheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 34,
    },
    actionSheetHeader: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        alignItems: 'center' as const,
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    actionSheetTitle: {
        fontSize: 18,
        fontWeight: '600' as const,
    },
    actionSheetItem: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        padding: 20,
        borderBottomWidth: 1,
    },
    actionSheetItemText: {
        fontSize: 16,
        marginLeft: 16,
    },
    actionSheetCancelText: {
        fontSize: 16,
        fontWeight: '600' as const,
        textAlign: 'center' as const,
    },
    imageModal: {
        margin: 20,
        borderRadius: 16,
        maxHeight: '80%' as any,
    },
    imageModalHeader: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        alignItems: 'center' as const,
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    imageModalTitle: {
        fontSize: 18,
        fontWeight: '600' as const,
    },
    previewImage: {
        width: '100%' as any,
        height: 300,
        resizeMode: 'cover' as const,
    },
    imageModalActions: {
        flexDirection: 'row' as const,
        padding: 20,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center' as const,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600' as const,
    },
    loadingModal: {
        margin: 40,
        padding: 40,
        borderRadius: 16,
        alignItems: 'center' as const,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: '600' as const,
        marginTop: 20,
        marginBottom: 8,
    },
    loadingSubtext: {
        fontSize: 14,
        textAlign: 'center' as const,
    },
    resultModal: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%' as any,
    },
    resultModalHeader: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        alignItems: 'center' as const,
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    resultModalTitle: {
        fontSize: 20,
        fontWeight: '700' as const,
    },
});




