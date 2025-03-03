import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import { productListReducers, productDetailReducers, productAddReducer } from "./Reducers/Product";
import { thunk } from "redux-thunk";
import { userLoginReducer, userRegistrationReducer } from "./Reducers/User";
import { cartReducer } from "./Reducers/Cart";
import { orderDetailReducer, orderListReducer, orderPaymentReducer, orderReducer } from "./Reducers/Order";

const persistConfig = {
    key: "root",
    storage,
    version: 1,
};

const rootReducer = combineReducers({
    productListReducer: productListReducers,
    productDetailReducer: productDetailReducers,
    userLoginReducer: userLoginReducer,
    userRegistrationReducer: userRegistrationReducer,
    cartReducer: cartReducer,
    productAdd: productAddReducer,

    orderReducer: orderReducer,
    orderDetailReducer: orderDetailReducer,
    orderPaymentReducer: orderPaymentReducer,
    orderListReducer: orderListReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    // Using middleware to concatenate the thunk middleware correctly
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Disable serializableCheck to work with redux-persist
        }).concat(thunk as any), // Explicitly cast thunk to any to resolve typing issues
});

export const persistor = persistStore(store);

// Export types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
