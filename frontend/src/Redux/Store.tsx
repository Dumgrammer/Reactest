import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import { productListReducers, productDetailReducers } from "./Reducers/Product";
import { thunk } from "redux-thunk";

const persistConfig = {
    key: "root",
    storage,
    version: 1,
};

const rootReducer = combineReducers({
    productListReducer: productListReducers,
    productDetailReducer: productDetailReducers,
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
