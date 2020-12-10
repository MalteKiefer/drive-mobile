import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';


function SVG(props: any) {

    const defaultColor = props.color ? props.color : 'blue';

    const options = {
        color: defaultColor.startsWith('#') ? defaultColor : props.defaultColors[defaultColor],
        width: props.width ? props.width : 38,
        height: props.height ? props.height : 38
    }

    return <View style={[StyleSheet.absoluteFill]}>
        <Svg
            viewBox="0 0 38 38"
            width={options.width}
            height={options.height}>
            <Path
                fill={options.color}
                d="M794,474.383198 C794,473.895421 794.376099,473.5 794.865081,473.5 L831.134919,473.5 C831.61269,473.5 832,473.874561 832,474.383198 L832,476.116802 C832,476.604579 831.623901,477 831.134919,477 L794.865081,477 C794.38731,477 794,476.625439 794,476.116802 L794,474.383198 L794,474.383198 L794,474.383198 L794,474.383198 Z M795.727273,449.875608 C795.727273,449.392023 796.098366,449 796.586934,449 L803.503975,449 C803.978753,449 804.363636,449.400751 804.363636,449.875608 L804.363636,469.124392 C804.363636,469.607977 803.992543,470 803.503975,470 L796.586934,470 C796.112156,470 795.727273,469.599249 795.727273,469.124392 L795.727273,449.875608 L795.727273,449.875608 L795.727273,449.875608 L795.727273,449.875608 Z M808.681818,442.868688 C808.681818,442.388925 809.052912,442 809.54148,442 L816.45852,442 C816.933298,442 817.318182,442.395817 817.318182,442.868688 L817.318182,469.131312 C817.318182,469.611075 816.947088,470 816.45852,470 L809.54148,470 C809.066702,470 808.681818,469.604183 808.681818,469.131312 L808.681818,442.868688 L808.681818,442.868688 L808.681818,442.868688 L808.681818,442.868688 Z M821.636364,456.875763 C821.636364,456.392092 822.007457,456 822.496025,456 L829.413066,456 C829.887844,456 830.272727,456.403894 830.272727,456.875763 L830.272727,469.124237 C830.272727,469.607908 829.901634,470 829.413066,470 L822.496025,470 C822.021247,470 821.636364,469.596106 821.636364,469.124237 L821.636364,456.875763 L821.636364,456.875763 L821.636364,456.875763 L821.636364,456.875763 Z"
                transform="translate(-794 -442)"
                fill-rule="evenodd"
            />
        </Svg>
    </View>;
}

export default SVG;