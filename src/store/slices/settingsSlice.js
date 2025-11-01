import { createSlice } from '@reduxjs/toolkit';

const loadSettingsFromStorage = () => {
  try {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : { unit: 'metric' };
  } catch (error) {
    console.error('Error loading settings:', error);
    return { unit: 'metric' };
  }
};

const saveSettingsToStorage = (settings) => {
  try {
    localStorage.setItem('settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState: loadSettingsFromStorage(),
  reducers: {
    setUnit: (state, action) => {
      state.unit = action.payload;
      saveSettingsToStorage(state);
    },
    toggleUnit: (state) => {
      state.unit = state.unit === 'metric' ? 'imperial' : 'metric';
      saveSettingsToStorage(state);
    },
  },
});

export const { setUnit, toggleUnit } = settingsSlice.actions;
export default settingsSlice.reducer;
