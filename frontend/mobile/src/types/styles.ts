// Type definitions for component prop compatibility
import { TextStyle } from 'react-native';

export interface TypographyStyle {
    fontSize: number;
    fontWeight: string;
}

export interface ExtendedTextStyle extends TextStyle {
    fontSize: number;
    fontWeight: string;
    color: string;
}

// Helper function to ensure proper style merging
export const mergeTextStyles = (baseStyle: TextStyle, dynamicStyle: TypographyStyle & { color: string }): TextStyle => {
    return {
        ...baseStyle,
        fontSize: dynamicStyle.fontSize,
        fontWeight: dynamicStyle.fontWeight as TextStyle['fontWeight'],
        color: dynamicStyle.color,
    };
};

// Export utility for proper TypeScript-compatible style merging
export const createTextStyle = (style: Partial<ExtendedTextStyle>): TextStyle => style as TextStyle;
