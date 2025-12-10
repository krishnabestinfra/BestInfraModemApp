

import checkConnectionGif from '../../assets/images/Check_connection.gif';
import voltageCheckGif from '../../assets/images/voltageCheck.gif';
import checkSignalGif from '../../assets/images/Check_singal.gif';
import checkConnection2Gif from '../../assets/icons/check_connection2.gif';
import voltageCheck2Gif from '../../assets/icons/voltageCheck2.gif';
import checkSignal2Gif from '../../assets/icons/Check_singal2.gif';


export const troubleshootStepsByCode = {
  112: [
    {
        id: 1,
        title: 'Check Cable Connection',
        description: 'Ensure every cable and connector is firmly seated on the modem and meter.',
        image: checkConnectionGif,
    
        noTitle: 'Cable Not Connected Properly',
        noSubtitle: 'The cable connection check has failed. Please follow these steps.',
        noImage: checkConnection2Gif,
        noSteps: [
          'Disconnect all cables and inspect for any visible damage',
          'Firmly reconnect all cables ensuring you hear/feel a click when properly seated',
          'Wait 30 seconds for the modem to recognize the connections',
        ]
      },
      {
        id: 2,
        title: 'Measure Input Voltage',
        description: 'Use the multimeter to confirm the supply voltage.',
        image: voltageCheckGif,
    
        noTitle: 'Voltage Not Detected at Input Line',
        noImage: voltageCheck2Gif,
        noSubtitle: 'No voltage has been detected. Follow these corrective steps carefully.',
        noSteps: [
          'Check if the power outlet is working by testing with another device',
          'Inspect the power adapter for any damage or burnt smell',
          'Verify the circuit breaker has not tripped for this line',
        ]
      },
      {
        id: 3,
        title: 'Confirm Communication',
        description: 'Check if the meter symbol on your device shows active communication.',
        image: checkConnectionGif,
        noTitle: 'Communication Not Established',
        noSubtitle: 'The modem is unable to communicate with the network. Follow these steps.',
        noImage: checkConnection2Gif,
        noSteps: [
          'Power cycle the modem by unplugging it for 30 seconds',
          'Check that network cables are securely connected',
          'Verify network settings and configuration are correct',
        ]
      },
  ],

  202: [
    {
      id: 1,
      title: 'Check Power Supply',
      description: 'Ensure that the main power cable is firmly connected and the meter is receiving stable input supply.',
      image: voltageCheckGif,
      noTitle: 'Power Supply Not Proper',
      noSubtitle: 'The power supply check has failed. Please follow the steps below to restore proper power to the modem.',
      noImage: voltageCheck2Gif,
      noSteps: [
        'Inspect the MCB/isolator at the installation point and turn it ON if it is OFF.',
        'Verify that the incoming AC supply is stable and available.',
        'If a fuse is present, check whether it is blown and replace if necessary.',
      ]
    },
    {
      id: 2,
      title: 'Check voltage present at the input line',
      description: 'Use the test device to confirm voltage is present in the input line.',
      image: checkConnectionGif,
      noTitle: 'Voltage Not Detected at Input Line',
      noSubtitle: 'No voltage has been detected. Follow these corrective steps carefully.',
      noImage: checkConnection2Gif,
      noSteps: [
        'Check if the power outlet is working by testing with another device',
        'Inspect the power adapter for any damage or burnt smell',
        'Verify the circuit breaker has not tripped for this line',
      ]
    },
    {
      id: 3,
      title: 'Change SMPS Board',
      description: 'Replace the SMPS board and ensure the modem shows active communication.',
      image: checkSignalGif,
      noTitle: 'SMPS Replacement Unsuccessful',
      noSubtitle: 'The SMPS replacement check has failed. Please follow these steps to complete the installation properly.',
      noImage: checkSignal2Gif,
      noSteps: [
        'Re-seat the connectors properly — no loose pins or unconnected points.',
        'Check for burnt marks or damage on the SMPS socket area.',
        'Clean dust or moisture at the SMPS installation area before retrying.',
      ]
    },
    {
      id: 3,
      title: 'Confirm Communication',
      description: 'Check if the meter symbol on your device shows active communication.',
      image: checkConnectionGif,
      noTitle: 'Communication Not Established',
      noSubtitle: 'The modem is unable to communicate with the network. Follow these steps.',
      noImage: checkConnection2Gif,
      noSteps: [
        'Power cycle the modem by unplugging it for 30 seconds',
        'Check that network cables are securely connected',
        'Verify network settings and configuration are correct',
      ]
    },
  ],

  // Code 214: DCU/Modem Power Failed
  214: [
    {
      id: 1,
      title: 'Check Power Supply',
      description: 'Ensure that the main power cable is firmly connected and the meter is receiving stable input supply.',
      image: voltageCheckGif,
      noTitle: 'Power Supply Not Proper',
      noSubtitle: 'The power supply check has failed. Please follow the steps below to restore proper power to the modem.',
      noImage: voltageCheck2Gif,
      noSteps: [
        'Inspect the MCB/isolator at the installation point and turn it ON if it is OFF.',
        'Verify that the incoming AC supply is stable and available.',
        'If a fuse is present, check whether it is blown and replace if necessary.',
      ]
    },
    {
      id: 2,
      title: 'Change SMPS Board',
      description: 'Replace the SMPS board and ensure the modem shows active communication.',
      image: voltageCheckGif,
      noTitle: 'SMPS Replacement Unsuccessful',
      noSubtitle: 'The SMPS replacement check has failed. Please follow these steps to complete the installation properly.',
      noImage: voltageCheck2Gif,
      noSteps: [
        'Re-seat the connectors properly — no loose pins or unconnected points.',
        'Check for burnt marks or damage on the SMPS socket area.',
        'Clean dust or moisture at the SMPS installation area before retrying.',
      ]
    },
    {
      id: 3,
      title: 'Confirm Communication',
      description: 'Check if the meter symbol on your device shows active communication.',
      image: checkConnectionGif,
      noTitle: 'Communication Not Established',
      noSubtitle: 'The modem is unable to communicate with the network. Follow these steps.',
      noImage: checkConnection2Gif,
      noSteps: [
        'Power cycle the modem by unplugging it for 30 seconds',
        'Check that network cables are securely connected',
        'Verify network settings and configuration are correct',
      ]
    },
  ],
};

/**
 * Get troubleshooting steps for a specific error code
 * @param {number} errorCode 
 * @returns {Array} Troubleshooting steps for the given error code
 */
export const getTroubleshootSteps = (errorCode) => {
  return troubleshootStepsByCode[errorCode] || [];
};

/**
 * Check if a troubleshooting flow exists for an error code
 * @param {number} errorCode - The error code to check
 * @returns {boolean} True if steps exist for this code
 */
export const hasTroubleshootSteps = (errorCode) => {
  return errorCode !== undefined && troubleshootStepsByCode.hasOwnProperty(errorCode);
};

