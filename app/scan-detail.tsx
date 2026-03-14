import React from "react";
import {
    ScrollView,
    TouchableOpacity,
    View,
    Image,
    StatusBar
} from "react-native";
import {ThemedText} from "@/components/ThemedText";
import {useColorScheme} from "@/hooks/useColorScheme";
import {Ionicons} from "@expo/vector-icons";
import {useTranslation} from "react-i18next";
import {useLocalSearchParams, useRouter} from 'expo-router';
import {
    getContainerStyle,
    getHeaderStyle,
    getTextStyle,
    getColor,
    getSpacing
} from "@/utils/styles";
import {DiseaseScanResult} from "@/hooks/useApi";

export default function ScanDetailScreen() {
    const colorScheme = useColorScheme() ?? "light";
    const {t, i18n} = useTranslation();
    const router = useRouter();
    const params = useLocalSearchParams();

    // Parse the scan data from params
    const detectionResult: DiseaseScanResult | null = params.scan ? JSON.parse(decodeURIComponent(params.scan as string)) : null;

    const buildScanPrompt = (scan: DiseaseScanResult) => {
        const cropDisease = scan.predicted_class.replace(/_/g, ' ');
        if (i18n.language === 'ur') {
            return [
                `میری فصل اسکین رپورٹ کی تفصیل:`,
                `بیماری: ${cropDisease}`,
                `اعتماد: ${scan.confidence_percent.toFixed(2)}%`,
                `حیثیت: ${scan.status}`,
                `شدت: ${scan.severity_range}`,
                `تفصیل: ${scan.description_ur || scan.description}`,
                `تجویز کردہ اقدام: ${scan.recommended_action_ur || scan.recommended_action}`,
                `براہ کرم کسان کے لیے آسان زبان میں مکمل رہنمائی دیں: وجہ، فوری علاج، اگلے 7 دن کا پلان، اور احتیاطی تدابیر۔`,
            ].join('\n');
        }

        return [
            `Here are my crop scan details:`,
            `Detected disease: ${cropDisease}`,
            `Confidence: ${scan.confidence_percent.toFixed(2)}%`,
            `Status: ${scan.status}`,
            `Severity: ${scan.severity_range}`,
            `Description: ${scan.description}`,
            `Recommended action: ${scan.recommended_action}`,
            `Please explain this in simple farmer-friendly language: cause, immediate treatment, next 7-day plan, and prevention steps.`,
        ].join('\n');
    };

    const handleAskChatbot = () => {
        if (!detectionResult) return;

        const prompt = buildScanPrompt(detectionResult);
        router.push({
            pathname: '/(tabs)/chat',
            params: {
                scanPrompt: prompt,
                scanNonce: `${detectionResult.id || Date.now()}`,
            }
        });
    };

    if (!detectionResult) {
        return (
            <View style={[getContainerStyle(colorScheme), {flex: 1, justifyContent: 'center', alignItems: 'center'}]}>
                <ThemedText style={{...getTextStyle(colorScheme, 'heading'), color: getColor(colorScheme, 'text')}}>
                    No scan data available
                </ThemedText>
            </View>
        );
    }

    return (
        <View style={[getContainerStyle(colorScheme), {flex: 1}]}>
            <StatusBar barStyle="light-content" backgroundColor={getColor(colorScheme, 'primary')} />

            {/* Header */}
            <View style={[getHeaderStyle(colorScheme), {paddingVertical: getSpacing('sm')}]}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    <TouchableOpacity onPress={() => router.back()} style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Ionicons name="chevron-back" size={24} color={getColor(colorScheme, 'buttonText')}/>
                        <ThemedText style={{...getTextStyle(colorScheme, 'body'), color: getColor(colorScheme, 'buttonText'), marginLeft: getSpacing('xs')}}>
                            Back
                        </ThemedText>
                    </TouchableOpacity>
                    <ThemedText style={{...getTextStyle(colorScheme, 'title'), fontSize: 24, fontWeight: '600', color: getColor(colorScheme, 'buttonText')}}>
                        Scan Details
                    </ThemedText>
                    <View style={{width: 60}} />
                </View>
            </View>

            <ScrollView style={getContainerStyle(colorScheme)} showsVerticalScrollIndicator={false}>
                <View style={{padding: getSpacing('md')}}>
                    {/* Image */}
                    {detectionResult.imageUri && (
                        <Image
                            source={{uri: detectionResult.imageUri}}
                            style={{width: '100%', height: 250, borderRadius: 12, marginBottom: getSpacing('lg')}}
                        />
                    )}

                    {/* Status Badge */}
                    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: getSpacing('lg')}}>
                        <View style={{flex: 1, padding: getSpacing('md'), borderRadius: 12, backgroundColor: detectionResult.is_healthy ? getColor(colorScheme, 'success') : getColor(colorScheme, 'warning')}}>
                            <ThemedText style={{fontSize: 24, fontWeight: 'bold', color: getColor(colorScheme, 'buttonText'), textAlign: 'center'}}>
                                {detectionResult.status}
                            </ThemedText>
                        </View>
                    </View>

                    {/* Disease Name */}
                    <View style={{marginBottom: getSpacing('lg')}}>
                        <ThemedText style={{...getTextStyle(colorScheme, 'caption'), color: getColor(colorScheme, 'textSecondary'), marginBottom: getSpacing('xs')}}>
                            Detected Disease
                        </ThemedText>
                        <ThemedText style={{...getTextStyle(colorScheme, 'heading'), color: getColor(colorScheme, 'text'), fontSize: 28}}>
                            {detectionResult.predicted_class.replace(/_/g, ' ')}
                        </ThemedText>
                    </View>

                    {/* Confidence with Progress Bar */}
                    <View style={{marginBottom: getSpacing('lg')}}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: getSpacing('xs')}}>
                            <ThemedText style={{...getTextStyle(colorScheme, 'body'), fontWeight: '600', color: getColor(colorScheme, 'text')}}>
                                {t('home.confidenceLevel')}
                            </ThemedText>
                            <ThemedText style={{...getTextStyle(colorScheme, 'body'), fontWeight: '600', color: getColor(colorScheme, 'primary')}}>
                                {detectionResult.confidence_percent.toFixed(2)}%
                            </ThemedText>
                        </View>
                        <View style={{height: 10, backgroundColor: getColor(colorScheme, 'outline'), borderRadius: 5, overflow: 'hidden'}}>
                            <View style={{height: '100%', width: `${detectionResult.confidence_percent}%`, backgroundColor: getColor(colorScheme, 'primary')}}/>
                        </View>
                    </View>

                    {/* Severity Range */}
                    {!detectionResult.is_healthy && (
                        <View style={{marginBottom: getSpacing('lg')}}>
                            <ThemedText style={{...getTextStyle(colorScheme, 'caption'), color: getColor(colorScheme, 'textSecondary'), marginBottom: getSpacing('xs')}}>
                                {t('home.severityRange')}
                            </ThemedText>
                            <ThemedText style={{...getTextStyle(colorScheme, 'body'), color: getColor(colorScheme, 'text'), fontSize: 16}}>
                                {detectionResult.severity_range}
                            </ThemedText>
                        </View>
                    )}

                    {/* Description */}
                    <View style={{marginBottom: getSpacing('lg')}}>
                        <ThemedText style={{...getTextStyle(colorScheme, 'body'), fontWeight: '600', color: getColor(colorScheme, 'text'), marginBottom: getSpacing('sm')}}>
                            {t('home.description')}
                        </ThemedText>
                        <ThemedText style={{...getTextStyle(colorScheme, 'body'), color: getColor(colorScheme, 'text')}}>
                            {i18n.language === 'ur' ? detectionResult.description_ur : detectionResult.description}
                        </ThemedText>
                    </View>

                    {/* Recommended Actions */}
                    {!detectionResult.is_healthy && (
                        <View style={{marginBottom: getSpacing('lg'), padding: getSpacing('md'), borderRadius: 12, backgroundColor: getColor(colorScheme, 'highlight'), borderWidth: 2, borderColor: getColor(colorScheme, 'primary')}}>
                            <ThemedText style={{...getTextStyle(colorScheme, 'body'), fontWeight: '600', color: getColor(colorScheme, 'primary'), marginBottom: getSpacing('sm')}}>
                                ⚡ {t('home.recommendedAction')}
                            </ThemedText>
                            <ThemedText style={{...getTextStyle(colorScheme, 'body'), color: getColor(colorScheme, 'primary')}}>
                                {i18n.language === 'ur' ? detectionResult.recommended_action_ur : detectionResult.recommended_action}
                            </ThemedText>
                        </View>
                    )}


                    <TouchableOpacity
                        style={{
                            backgroundColor: getColor(colorScheme, 'primary'),
                            borderRadius: 12,
                            paddingVertical: getSpacing('md'),
                            paddingHorizontal: getSpacing('md'),
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: getSpacing('lg')
                        }}
                        activeOpacity={0.8}
                        onPress={handleAskChatbot}
                    >
                        <Ionicons name="chatbubble-ellipses" size={18} color={getColor(colorScheme, 'buttonText')} />
                        <ThemedText style={{
                            ...getTextStyle(colorScheme, 'body'),
                            color: getColor(colorScheme, 'buttonText'),
                            fontWeight: '700',
                            marginLeft: getSpacing('sm')
                        }}>
                            {t('scanDetail.askChatbot')}
                        </ThemedText>
                    </TouchableOpacity>

                    {/* Spacer */}
                    <View style={{height: getSpacing('lg')}} />
                </View>
            </ScrollView>
        </View>
    );
}



