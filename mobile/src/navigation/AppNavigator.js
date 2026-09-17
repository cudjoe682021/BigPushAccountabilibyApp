import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import HomeDashboardScreen from '../screens/HomeDashboardScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import ReportProblemScreen from '../screens/ReportProblemScreen';
import ConfirmationScreen from '../screens/ConfirmationScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
return (
<NavigationContainer>
<Stack.Navigator initialRouteName="Splash">
<Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
<Stack.Screen name="Home" component={HomeDashboardScreen} options={{ title: 'Projects near you' }} />
<Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Project' }} />
<Stack.Screen name="ReportProblem" component={ReportProblemScreen} options={{ title: 'Report a problem' }} />
<Stack.Screen name="Confirmation" component={ConfirmationScreen} options={{ title: 'Thank you', headerBackVisible: false }} />
<Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
</Stack.Navigator>
</NavigationContainer>
);
}
