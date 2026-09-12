import React from 'react';
import { View } from 'react-native';
import { FormField } from './FormField';
import { provisionOrgModalStyles as styles } from '../styles/provisionOrgModal.styles';

interface OrgAddressFieldsProps {
  addressLine1: string;
  setAddressLine1: (val: string) => void;
  addressLine2: string;
  setAddressLine2: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  stateVal: string;
  setStateVal: (val: string) => void;
  postalCode: string;
  setPostalCode: (val: string) => void;
  postalCodeError?: string;
  country: string;
  setCountry: (val: string) => void;
}

export const OrgAddressFields: React.FC<OrgAddressFieldsProps> = ({
  addressLine1,
  setAddressLine1,
  addressLine2,
  setAddressLine2,
  city,
  setCity,
  stateVal,
  setStateVal,
  postalCode,
  setPostalCode,
  postalCodeError,
  country,
  setCountry,
}) => (
  <>
    <FormField
      label="Street Address Line 1"
      placeholder="e.g. 123 Innovation Blvd"
      value={addressLine1}
      onChangeText={setAddressLine1}
    />

    <FormField
      label="Address Line 2"
      placeholder="Suite, Floor, Building"
      value={addressLine2}
      onChangeText={setAddressLine2}
    />

    <View style={styles.rowInputs}>
      <View style={{ flex: 1 }}>
        <FormField
          label="City"
          placeholder="e.g. Hyderabad"
          value={city}
          onChangeText={setCity}
        />
      </View>
      <View style={{ flex: 1 }}>
        <FormField
          label="State"
          placeholder="e.g. Telangana"
          value={stateVal}
          onChangeText={setStateVal}
        />
      </View>
    </View>

    <View style={styles.rowInputs}>
      <View style={{ flex: 1 }}>
        <FormField
          label="Postal Code"
          placeholder="e.g. 500081"
          value={postalCode}
          onChangeText={setPostalCode}
          error={postalCodeError}
        />
      </View>
      <View style={{ flex: 1 }}>
        <FormField
          label="Country"
          placeholder="India"
          value={country}
          onChangeText={setCountry}
        />
      </View>
    </View>
  </>
);
