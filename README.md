# CartZA Mobile App 📱

The React Native mobile application for the CartZA campus food ordering platform. Built with Expo, this app provides two distinct experiences based on user roles: a kitchen dashboard for vendors and a seamless ordering menu for students.

## Tech Stack
* **Framework:** React Native (Expo)
* **State Management:** Redux Toolkit & RTK Query
* **Navigation:** React Navigation
* **Build System:** EAS (Expo Application Services)

## Features
* **Student View:** Browse the menu, add items to the cart, checkout securely, and track live order status. Withdraw pending orders instantly.
* **Vendor View (Kitchen Dashboard):** Live queue management, toggle menu item availability (in/out of stock), add/edit menu items, and scan student QR codes for order pickup.
* Auto-polling for real-time menu and order updates.

## How to Run Locally

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Ensure your local network IP is pointing to your backend in `src/store/api/` files, or point it to your live cloud backend.
4. Run `npx expo start --clear` to start the Metro bundler.
5. Scan the QR code with the Expo Go app on your physical device, or press `a` to run on an Android emulator.
