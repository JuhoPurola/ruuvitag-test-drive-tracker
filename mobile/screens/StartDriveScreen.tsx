import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_ENDPOINTS } from '../config';
import CustomAlert from '../components/CustomAlert';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  color: string;
  available: boolean;
}

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface SalesPerson {
  id: string;
  name: string;
  email: string;
}

export default function StartDriveScreen() {
  const navigation = useNavigation();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salespeople, setSalespeople] = useState<SalesPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(null);

  const [showVehicles, setShowVehicles] = useState(false);
  const [showCustomers, setShowCustomers] = useState(false);
  const [showSalespeople, setShowSalespeople] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title?: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'confirm';
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vehiclesRes, customersRes, salespeopleRes] = await Promise.all([
        axios.get(API_ENDPOINTS.vehicles),
        axios.get(API_ENDPOINTS.customers),
        axios.get(API_ENDPOINTS.salespeople),
      ]);

      if (vehiclesRes.data.success) {
        // Only show available vehicles
        const available = vehiclesRes.data.data.filter(
          (v: Vehicle) => v.available === true
        );
        setVehicles(available);
      }
      if (customersRes.data.success) setCustomers(customersRes.data.data);
      if (salespeopleRes.data.success) setSalespeople(salespeopleRes.data.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Failed to load data',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const handleStartTestDrive = async () => {
    if (!selectedVehicle || !selectedCustomer || !selectedSalesperson) {
      setAlertConfig({
        visible: true,
        message: 'Please select vehicle, customer, and salesperson',
        type: 'info',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(API_ENDPOINTS.testDrives, {
        vehicleId: selectedVehicle,
        customerId: selectedCustomer,
        salesPersonId: selectedSalesperson,
        status: 'active',
        startTime: new Date().toISOString(),
      });

      if (response.data.success) {
        // Close dropdowns first to prevent z-index issues
        setShowVehicles(false);
        setShowCustomers(false);
        setShowSalespeople(false);

        setSelectedVehicle(null);
        setSelectedCustomer(null);
        setSelectedSalesperson(null);
        fetchData();

        // Navigate to Active tab
        navigation.navigate('Active' as never);
      }
    } catch (err: any) {
      console.error('Error starting test drive:', err);
      const errorMessage = err.response?.data?.error || 'Failed to start test drive';
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedVehicle = () => vehicles.find((v) => v.id === selectedVehicle);
  const getSelectedCustomer = () => customers.find((c) => c.id === selectedCustomer);
  const getSelectedSalesperson = () => salespeople.find((s) => s.id === selectedSalesperson);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Start Test Drive</Text>
        <Text style={styles.subtitle}>Select vehicle, customer, and salesperson</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Vehicle Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SELECT VEHICLE</Text>
          <TouchableOpacity
            style={[styles.selector, selectedVehicle && styles.selectorSelected]}
            onPress={() => setShowVehicles(!showVehicles)}
          >
            {selectedVehicle ? (
              <View>
                <Text style={styles.selectorTextSelected}>
                  {getSelectedVehicle()?.year} {getSelectedVehicle()?.make}{' '}
                  {getSelectedVehicle()?.model}
                </Text>
                <Text style={styles.selectorSubtext}>
                  {getSelectedVehicle()?.color}
                </Text>
              </View>
            ) : (
              <Text style={styles.selectorPlaceholder}>Choose a vehicle</Text>
            )}
            <Text style={styles.selectorArrow}>{showVehicles ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showVehicles && (
            <View style={styles.dropdown}>
              {vehicles.length === 0 ? (
                <Text style={styles.emptyDropdown}>No vehicles available</Text>
              ) : (
                vehicles.map((vehicle) => (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedVehicle(vehicle.id);
                      setShowVehicles(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </Text>
                    <Text style={styles.dropdownItemSubtext}>{vehicle.color}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        {/* Customer Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SELECT CUSTOMER</Text>
          <TouchableOpacity
            style={[styles.selector, selectedCustomer && styles.selectorSelected]}
            onPress={() => setShowCustomers(!showCustomers)}
          >
            {selectedCustomer ? (
              <View>
                <Text style={styles.selectorTextSelected}>
                  {getSelectedCustomer()?.name}
                </Text>
                {getSelectedCustomer()?.phone && (
                  <Text style={styles.selectorSubtext}>
                    {getSelectedCustomer()?.phone}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={styles.selectorPlaceholder}>Choose a customer</Text>
            )}
            <Text style={styles.selectorArrow}>{showCustomers ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showCustomers && (
            <View style={styles.dropdown}>
              {customers.length === 0 ? (
                <Text style={styles.emptyDropdown}>No customers registered</Text>
              ) : (
                customers.map((customer) => (
                  <TouchableOpacity
                    key={customer.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedCustomer(customer.id);
                      setShowCustomers(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{customer.name}</Text>
                    {customer.phone && (
                      <Text style={styles.dropdownItemSubtext}>{customer.phone}</Text>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        {/* Salesperson Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SELECT SALESPERSON</Text>
          <TouchableOpacity
            style={[styles.selector, selectedSalesperson && styles.selectorSelected]}
            onPress={() => setShowSalespeople(!showSalespeople)}
          >
            {selectedSalesperson ? (
              <Text style={styles.selectorTextSelected}>
                {getSelectedSalesperson()?.name}
              </Text>
            ) : (
              <Text style={styles.selectorPlaceholder}>Choose a salesperson</Text>
            )}
            <Text style={styles.selectorArrow}>{showSalespeople ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showSalespeople && (
            <View style={styles.dropdown}>
              {salespeople.length === 0 ? (
                <Text style={styles.emptyDropdown}>No salespeople registered</Text>
              ) : (
                salespeople.map((person) => (
                  <TouchableOpacity
                    key={person.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedSalesperson(person.id);
                      setShowSalespeople(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{person.name}</Text>
                    <Text style={styles.dropdownItemSubtext}>{person.email}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[
            styles.startButton,
            (!selectedVehicle || !selectedCustomer || !selectedSalesperson) &&
              styles.startButtonDisabled,
          ]}
          onPress={handleStartTestDrive}
          disabled={
            submitting ||
            !selectedVehicle ||
            !selectedCustomer ||
            !selectedSalesperson
          }
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.startButtonText}>Start Test Drive</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={closeAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#1e293b',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  selector: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  selectorTextSelected: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  selectorSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  selectorArrow: {
    fontSize: 12,
    color: '#6B7280',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  dropdownItemSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyDropdown: {
    padding: 16,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
  },
  startButton: {
    backgroundColor: '#10B981',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomSpace: {
    height: 40,
  },
});
