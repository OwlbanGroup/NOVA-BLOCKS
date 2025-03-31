import React from 'react';
import './HealthySuperElements.css'; // Importing CSS for styling

const HealthySuperElements = () => {
    return (
        <div>
            <h1>Healthy Elements</h1>
            <ul>
                <li>
                    <img src="/images/quinoa.png" alt="Quinoa" className="element-icon" />
                    Quinoa - A superfood rich in protein and fiber.
                </li>
                <li>
                    <img src="/images/spinach.png" alt="Spinach" className="element-icon" />
                    Spinach - Packed with vitamins and minerals.
                </li>
                <li>
                    <img src="/images/blueberries.png" alt="Blueberries" className="element-icon" />
                    Blueberries - High in antioxidants.
                </li>
            </ul>
            <h1>Super Elements</h1>
            <ul>
                <li>
                    <img src="/images/chia-seeds.png" alt="Chia Seeds" className="element-icon" />
                    Chia Seeds - Great source of omega-3 fatty acids.
                </li>
                <li>
                    <img src="/images/avocado.png" alt="Avocado" className="element-icon" />
                    Avocado - Healthy fats and nutrients.
                </li>
                <li>
                    <img src="/images/sweet-potatoes.png" alt="Sweet Potatoes" className="element-icon" />
                    Sweet Potatoes - High in vitamins and fiber.
                </li>
            </ul>
        </div>
    );
};

export default HealthySuperElements;
