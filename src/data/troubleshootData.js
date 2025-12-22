import CheckPowerSupplyGif from '../../assets/images/Check Power Supply.gif';
import ReCheckPowerSupplyGif from '../../assets/images/ReCheckPowerSupply.gif';
import CheckVoltagePresentGif from '../../assets/images/Check Voltage present at Input.gif';
import ReCheckVoltagePresentGif from '../../assets/images/ReCheckVoltage.gif';
import ChangeSMPSBoardGif from '../../assets/images/Change SMPS Board.gif';
import ReCheckSMPSBoardGif from '../../assets/images/ReCheckSMPSBoard.gif';
import CheckCableConnectionGif from '../../assets/images/Check Cable Connection.gif';
import ReCheckCableConnectionGif from '../../assets/images/RecheckCableConnection.gif';
import ConfirmCommunicationGif from '../../assets/images/Confirm Communication.gif';
import ReCheckCommunicationGif from '../../assets/images/ReCheckCommunication.gif';
import ModemReplacedGif from '../../assets/Modem replaced.gif';
export const troubleshootStepsByCode = {
  112: [
    {
        id: 1,
        title: 'Check Cable Connection',
        description: 'Ensure every cable and connector is firmly seated on the modem and meter.',
        image: CheckCableConnectionGif,
    
        noTitle: 'Cable Not Connected Properly',
        noSubtitle: 'The cable connection check has failed. Please follow these steps.',
        noImage: ReCheckCableConnectionGif,
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
        image: CheckVoltagePresentGif,
    
        noTitle: 'Voltage Not Detected at Input Line',
        noImage: ReCheckVoltagePresentGif,
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
        image: ConfirmCommunicationGif,
        noTitle: 'Communication Not Established',
        noSubtitle: 'The modem is unable to communicate with the network. Follow these steps.',
        noImage: ReCheckCommunicationGif,
        noSteps: [
          'Power cycle the modem by unplugging it for 30 seconds',
          'Check that network cables are securely connected',
          'Verify network settings and configuration are correct',
        ]
      },
      {
        id: 4,
        title: 'Is Modem Replaced ',
        description: 'Check if the meter symbol on your device shows active communication.',
        image: ModemReplacedGif,
      },
  ],
  202: [
    {
      id: 1,
      title: 'Check Power Supply',
      description: 'Ensure that the main power cable is firmly connected and the meter is receiving stable input supply.',
      image: CheckPowerSupplyGif,
      noTitle: 'Power Supply Not Proper',
      noSubtitle: 'The power supply check has failed. Please follow the steps below to restore proper power to the modem.',
      noImage: ReCheckPowerSupplyGif,
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
      image: CheckVoltagePresentGif,
      noTitle: 'Voltage Not Detected at Input Line',
      noSubtitle: 'No voltage has been detected. Follow these corrective steps carefully.',
      noImage: ReCheckVoltagePresentGif,
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
      image: ChangeSMPSBoardGif,
      noTitle: 'SMPS Replacement Unsuccessful',
      noSubtitle: 'The SMPS replacement check has failed. Please follow these steps to complete the installation properly.',
      noImage: ReCheckSMPSBoardGif,
      noSteps: [
        'Re-seat the connectors properly — no loose pins or unconnected points.',
        'Check for burnt marks or damage on the SMPS socket area.',
        'Clean dust or moisture at the SMPS installation area before retrying.',
      ]
      },
      {
        id: 4,
        title: 'Confirm Communication',
        description: 'Check if the meter symbol on your device shows active communication.',
        image: ConfirmCommunicationGif,
        noTitle: 'Communication Not Established',
        noSubtitle: 'The modem is unable to communicate with the network. Follow these steps.',
        noImage: ReCheckCommunicationGif,
        noSteps: [
          'Power cycle the modem by unplugging it for 30 seconds',
          'Check that network cables are securely connected',
          'Verify network settings and configuration are correct',
        ]
      },
      {
        id: 5,
        title: 'Is Modem Replaced ',
        description: 'Check if the meter symbol on your device shows active communication.',
        image: ModemReplacedGif,
      },
  ],

  214: [
    {
      id: 1,
      title: 'Check Power Supply',
      description: 'Ensure that the main power cable is firmly connected and the meter is receiving stable input supply.',
      image: CheckPowerSupplyGif,
      noTitle: 'Power Supply Not Proper',
      noSubtitle: 'The power supply check has failed. Please follow the steps below to restore proper power to the modem.',
      noImage: ReCheckPowerSupplyGif,
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
      image: CheckVoltagePresentGif,
      noTitle: 'Voltage Not Detected at Input Line',
      noSubtitle: 'No voltage has been detected. Follow these corrective steps carefully.',
      noImage: ReCheckVoltagePresentGif,
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
      image: ChangeSMPSBoardGif,
      noTitle: 'SMPS Replacement Unsuccessful',
      noSubtitle: 'The SMPS replacement check has failed. Please follow these steps to complete the installation properly.',
      noImage: ReCheckSMPSBoardGif,
      noSteps: [
        'Re-seat the connectors properly — no loose pins or unconnected points.',
        'Check for burnt marks or damage on the SMPS socket area.',
        'Clean dust or moisture at the SMPS installation area before retrying.',
      ]
    },
      {
        id: 4,
        title: 'Confirm Communication',
        description: 'Check if the meter symbol on your device shows active communication.',
        image: ConfirmCommunicationGif,
        noTitle: 'Communication Not Established',
        noSubtitle: 'The modem is unable to communicate with the network. Follow these steps.',
        noImage: ReCheckCommunicationGif,
        noSteps: [
          'Power cycle the modem by unplugging it for 30 seconds',
          'Check that network cables are securely connected',
          'Verify network settings and configuration are correct',
        ]
      },
      {
        id: 5,
        title: 'Is Modem Replaced ',
        description: 'Check if the meter symbol on your device shows active communication.',
        image: ModemReplacedGif,
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

