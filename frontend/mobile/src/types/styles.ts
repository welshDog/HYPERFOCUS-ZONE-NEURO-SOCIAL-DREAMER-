// Type definitions for component prop compatibility
import { TextStyle } from 'react-native';

export interface TypographyStyle {
    fontSize: number;
    fontWeight: string;
}

export interface ExtendedTextStyle extends Omit<TextStyle, 'fontWeight'> {
    fontSize: number;
    fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
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
