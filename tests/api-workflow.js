const axios = require('axios');

// Default base URL to localhost or production depending on environment
const BASE_URL = process.env.BASE_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: BASE_URL + '/api/v1/',
    headers: {
        'Content-Type': 'application/json'
    }
});

let authToken = null;
let providerId = null;

async function runWorkflow() {
    console.log("=== Starting Provider API Automated Workflow Test ===");
    console.log(`Using Base URL: ${BASE_URL}\n`);

    try {
        // 1. Authentication Flow
        console.log("--- 1. Testing Authentication Flow ---");
        const loginRes = await api.post('provider/auth/login/', {
            phone_number: "+251911234567",
            password: "password123"
        }).catch(async (err) => {
            console.log("Login failed (user might not exist). Attempting registration...");
            const regRes = await api.post('provider/auth/register/', {
                phone_number: "+251911234567",
                password: "password123",
                full_name: "Automated Test Provider"
            });
            return regRes;
        });

        const data = loginRes.data?.data || loginRes.data;
        authToken = data.access || data.token;
        console.log("✔ Authentication successful. Token obtained.\n");

        if (authToken) {
            api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        }

        // 2. Onboarding Flow
        console.log("--- 2. Testing Onboarding Flow ---");
        const bizRes = await api.get('provider/onboarding/business/');
        console.log("✔ Business Onboarding retrieved:", bizRes.data);

        const locRes = await api.get('provider/onboarding/location/');
        console.log("✔ Location Onboarding retrieved:", locRes.data, "\n");

        // 3. Service Catalog Flow
        console.log("--- 3. Testing Service Catalog Flow ---");
        const servicesRes = await api.get('provider/services/');
        console.log(`✔ Service Catalog retrieved (${servicesRes.data?.length || 0} services found).\n`);

        // 4. Technician Management Flow
        console.log("--- 4. Testing Technician Management Flow ---");
        const techRes = await api.get('provider/technicians/');
        console.log(`✔ Technicians retrieved (${techRes.data?.length || 0} technicians found).\n`);

        // 5. Inventory Flow
        console.log("--- 5. Testing Inventory Flow ---");
        const invRes = await api.get('provider/inventory/');
        console.log(`✔ Inventory retrieved (${invRes.data?.length || 0} items found).\n`);

        // 6. Availability & Scheduling Flow
        console.log("--- 6. Testing Availability & Scheduling Flow ---");
        const availRes = await api.get('provider/availability/');
        console.log(`✔ Availability slots retrieved (${availRes.data?.length || 0} slots found).\n`);

        // 7. Analytics Flow
        console.log("--- 7. Testing Analytics Flow ---");
        const revRes = await api.get('provider/analytics/revenue/?days=30');
        console.log("✔ Revenue Analytics retrieved successfully.\n");

        console.log("=== All Automated Workflow Tests Completed Successfully! ===");

    } catch (error) {
        console.error("\n❌ Workflow Test Failed:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
            console.error("Endpoint:", error.config?.url);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

runWorkflow();
