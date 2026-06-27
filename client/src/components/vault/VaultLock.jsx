import { useState } from "react";
import { useVaultStore } from "../../store/useVaultStore";

const VaultLock = () => {

    const [pin, setPin] = useState("");

    const { verifyPin } = useVaultStore();

    const handleSubmit = async () => {

        try {
            await verifyPin(pin);

            alert("Vault Opened");

        } catch (error) {

            alert("Wrong PIN");
        }
    };

    return (
        <div>
            <h2>Enter Vault PIN</h2>

            <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) =>
                    setPin(e.target.value)
                }
            />

            <button onClick={handleSubmit}>
                Unlock Vault
            </button>
        </div>
    );
};

export default VaultLock;