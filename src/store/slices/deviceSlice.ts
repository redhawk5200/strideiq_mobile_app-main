import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Device {
  id: string
  name: string
  type: 'apple-watch' | 'garmin' | 'fitbit'
  isConnected: boolean
  lastSync?: string
}

interface DeviceState {
  connectedDevices: Device[]
  selectedDeviceId: string | null
  isConnecting: boolean
  error: string | null
}

const initialState: DeviceState = {
  connectedDevices: [],
  selectedDeviceId: null,
  isConnecting: false,
  error: null,
}

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    connectDeviceStart: (state) => {
      state.isConnecting = true
      state.error = null
    },
    connectDeviceSuccess: (state, action: PayloadAction<Device>) => {
      state.isConnecting = false
      const existingDevice = state.connectedDevices.find(d => d.id === action.payload.id)
      if (existingDevice) {
        existingDevice.isConnected = true
        existingDevice.lastSync = new Date().toISOString()
      } else {
        state.connectedDevices.push(action.payload)
      }
    },
    connectDeviceFailure: (state, action: PayloadAction<string>) => {
      state.isConnecting = false
      state.error = action.payload
    },
    disconnectDevice: (state, action: PayloadAction<string>) => {
      const device = state.connectedDevices.find(d => d.id === action.payload)
      if (device) {
        device.isConnected = false
      }
    },
    removeDevice: (state, action: PayloadAction<string>) => {
      state.connectedDevices = state.connectedDevices.filter(d => d.id !== action.payload)
      if (state.selectedDeviceId === action.payload) {
        state.selectedDeviceId = null
      }
    },
    selectDevice: (state, action: PayloadAction<string>) => {
      state.selectedDeviceId = action.payload
    },
    syncDevice: (state, action: PayloadAction<string>) => {
      const device = state.connectedDevices.find(d => d.id === action.payload)
      if (device) {
        device.lastSync = new Date().toISOString()
      }
    },
    clearDeviceError: (state) => {
      state.error = null
    },
  },
})

export const {
  connectDeviceStart,
  connectDeviceSuccess,
  connectDeviceFailure,
  disconnectDevice,
  removeDevice,
  selectDevice,
  syncDevice,
  clearDeviceError,
} = deviceSlice.actions

export default deviceSlice.reducer
