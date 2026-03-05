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
                        <ThemedText style={{...getTextStyle(colorScheme, 'body'), color: getColor(colorScheme, 'text'), lineHeight: 24}}>
                            {i18n.language === 'ur' ? detectionResult.description_ur : detectionResult.description}
                        </ThemedText>
                    </View>

                    {/* Recommended Actions */}
                    {!detectionResult.is_healthy && (
                        <View style={{marginBottom: getSpacing('lg'), padding: getSpacing('md'), borderRadius: 12, backgroundColor: getColor(colorScheme, 'highlight'), borderWidth: 2, borderColor: getColor(colorScheme, 'primary')}}>
                            <ThemedText style={{...getTextStyle(colorScheme, 'body'), fontWeight: '600', color: getColor(colorScheme, 'primary'), marginBottom: getSpacing('sm')}}>
                                ⚡ {t('home.recommendedAction')}
                            </ThemedText>
                            <ThemedText style={{...getTextStyle(colorScheme, 'body'), color: getColor(colorScheme, 'primary'), lineHeight: 24}}>
                                {i18n.language === 'ur' ? detectionResult.recommended_action_ur : detectionResult.recommended_action}
                            </ThemedText>
                        </View>
                    )}

                    {/* Top 3 Predictions */}
                    <View style={{marginBottom: getSpacing('lg')}}>
                        <ThemedText style={{...getTextStyle(colorScheme, 'body'), fontWeight: '600', color: getColor(colorScheme, 'text'), marginBottom: getSpacing('md'), fontSize: 18}}>
                            {t('home.topPredictions')}
                        </ThemedText>
                        {detectionResult.top_3_predictions.map((pred, index) => (
                            <View
                                key={index}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingVertical: getSpacing('sm'),
                                    paddingHorizontal: getSpacing('sm'),
                                    marginBottom: getSpacing('xs'),
                                    borderRadius: 8,
                                    backgroundColor: index === 0 ? getColor(colorScheme, 'highlight') : getColor(colorScheme, 'surface'),
                                    borderWidth: 1,
                                    borderColor: index === 0 ? getColor(colorScheme, 'primary') : getColor(colorScheme, 'outline')
                                }}
                            >
                                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                                    <View style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 16,
                                        backgroundColor: index === 0 ? getColor(colorScheme, 'primary') : getColor(colorScheme, 'outline'),
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: getSpacing('sm')
                                    }}>
                                        <ThemedText style={{fontSize: 14, fontWeight: '700', color: getColor(colorScheme, 'buttonText')}}>
                                            {index + 1}
                                        </ThemedText>
                                    </View>
                                    <ThemedText style={{...getTextStyle(colorScheme, 'body'), color: getColor(colorScheme, 'text'), flex: 1}}>
                                        {pred.class_name.replace(/_/g, ' ')}
                                    </ThemedText>
                                </View>
                                <ThemedText style={{...getTextStyle(colorScheme, 'body'), fontWeight: '700', color: getColor(colorScheme, 'primary'), marginLeft: getSpacing('sm')}}>
                                    {pred.confidence.toFixed(2)}%
                                </ThemedText>
                            </View>
                        ))}
                    </View>

                    {/* Spacer */}
                    <View style={{height: getSpacing('lg')}} />
                </View>
            </ScrollView>
        </View>
    );
}



