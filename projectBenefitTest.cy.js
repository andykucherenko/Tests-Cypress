import { SELECTORS, URLS, EMAIL, PASSWORD } from '../support/consts';

describe('Project Benefits Page', () => {

    beforeEach(() => {
        cy.visit(URLS.login);
        cy.get(SELECTORS.emailField).type(EMAIL);
        cy.get(SELECTORS.passwordField).type(PASSWORD);
        cy.get(SELECTORS.loginButton).click();
        cy.url().should('not.include', '/login'); // Make sure that the login is successful
        cy.visit(URLS.myProjects);                // Go to the "My Projects" page
        cy.contains('Walmart Inventory Management').click();
    });

    // Function for selecting the unit of measurement
    const selectUnit = (index, unit) => {
        // Find and click on the button to select the unit of measurement by index
        cy.get('button[role="combobox"].flex.h-9.items-center.justify-between.whitespace-nowrap.rounded-md.border.border-input')
            .eq(index)
            .click();

        cy.get('[data-radix-popper-content-wrapper]', { timeout: 5000 })
            .should('be.visible')
            .within(() => {
                // Looking for a span with the nedeed character
                cy.get(`span:contains("${unit}")`)
                    .should('be.visible')
                    .click({ force: true });
            });
    };

    // Improved function to delete benefit by name
    const deleteBenefitByName = (name) => {
        cy.get('body').then(($body) => {
            // Navigate to benefits page first
            cy.contains('p', 'All benefits').click();
            cy.contains('Benefits').should('be.visible');

            // Check if benefit exists
            if ($body.text().includes(name)) {
                cy.log(`Deleting benefit: ${name}`);

                // Find the benefit and click its menu button
                //cy.contains(name)
                //    .parentsUntil('[data-testid*="benefit"]')
                //    .find('button[aria-haspopup="menu"]')
                //    .click({force: true});

                cy.get('button[aria-haspopup="menu"]').eq(11).scrollIntoView({
                    easing: 'linear',
                    duration: 1000,
                    offset: {top: -100, left: 0}
                }).click({force: true});

                cy.contains('[role="menuitem"]', 'Delete', {timeout: 5000})
                    .click({force: true});

                // Confirm deletion
                cy.contains('button', 'Delete', {timeout: 5000})
                    .should('be.visible')
                    .click({ force: true });

                cy.wait(1000);

                // Verify the benefit is deleted
                cy.contains(name).should('not.exist');
                cy.log(`✅ Benefit "${name}" deleted successfully`);
            } else {
                cy.log(`ℹ️ Benefit "${name}" not found, no need to delete`);
            }
        });
    };

    // Function to check for division by zero error message
    const checkDivisionByZeroError = () => {
        // Use Cypress built-in retry and fail mechanism
        cy.contains('The value cannot be zero or negative', { timeout: 10000 })
            .should('be.visible')
            .then(() => {
                cy.log('✅ Error message displayed correctly: "The value cannot be zero or negative"');
            });
    };

    // Cleanup after each test
    afterEach(() => {
        // Clean up both test benefits
        deleteBenefitByName('Division by zero test');
        deleteBenefitByName('Benefit test');
    });

    it('Adding new benefit and check new formula calculation', () => {
        cy.url().should('include', '/executive-report');
        cy.contains('p', 'All benefits').click();
        cy.contains('Benefits').should('be.visible');

        // Adding new benefit "Benefit test"
        cy.contains('button', 'Add benefit').click();
        // Scroll to teh "Edit" button and click
        cy.get('button[aria-haspopup="menu"]').eq(11).scrollIntoView({
            easing: 'linear',
            duration: 1000,
            offset: {top: -100, left: 0}
        }).click({force: true});

        cy.contains('[role="menuitem"]', 'Edit', {timeout: 5000})
            .click({force: true});

        // Fill Benefit name
        cy.contains('label', /Benefit Name/i).parent()
            .find('input')
            .clear()
            .type('Benefit test');

        // Fill Formula
        cy.contains('label', /Formula/i).parent()
            .find('input, textarea')
            .clear()
            .type('(A*B*C)/D-E');

        // Add 5 data points
        for (let i = 0; i < 5; i++) {
            cy.get('button').contains('Add Data Point').click();
        }

        // Inputs
        const dataPoints = [
            {name: 'Company  Revenue', value: '1,000,000', unit: '$'},
            {name: 'Revenue in Scope', value: '10', unit: '%'},
            {name: 'Number of FTEs', value: '15', unit: '#'},
            {name: 'Salary', value: '1,000', unit: '$'},
            {name: 'Benefit Factor', value: '1.5', unit: '#'}
        ];

        // Fill data point name
        dataPoints.forEach((point, index) => {
            cy.get('input.flex.h-9.w-full.rounded-md.border.border-input')
                .eq(4 + index * 2)
                .clear()
                .type(point.name);

            // Fill value
            cy.get('input.flex.h-9.w-full.rounded-md.border.border-input')
                .eq(5 + index * 2)
                .clear()
                .type(point.value);

            // Select unit
            selectUnit(index, point.unit);
        });

        // Change Ramp up rate
        cy.get('input.flex.h-9.w-full.rounded-md.border.border-input')
            .eq(14)
            .clear()
            .type('10');
        cy.get('input.flex.h-9.w-full.rounded-md.border.border-input')
            .eq(15)
            .clear()
            .type('20');
        cy.get('input.flex.h-9.w-full.rounded-md.border.border-input')
            .eq(16)
            .clear()
            .type('30');
        cy.get('input.flex.h-9.w-full.rounded-md.border.border-input')
            .eq(17)
            .clear()
            .type('40');
        cy.get('input.flex.h-9.w-full.rounded-md.border.border-input')
            .eq(18)
            .clear()
            .type('50');

        // Change Type of input
        cy.contains('button', 'Assumption').click();
        cy.contains('label', 'Input').click();

        // Delete the benefit
        cy.contains('p', 'All benefits').click();
        cy.contains('Benefits').should('be.visible');
        cy.get('button[aria-haspopup="menu"]').eq(11).scrollIntoView({
            easing: 'linear',
            duration: 1000,
            offset: {top: -100, left: 0}
        }).click({force: true});

        cy.contains('[role="menuitem"]', 'Delete', {timeout: 5000})
            .click({force: true});
        cy.contains('Delete').should('be.visible').click({ force: true }).wait(1000);

        cy.contains('Benefit test').should('not.exist'); // Check if the benefit is deleted
        
    });

    it.only('Should show error message when dividing by zero in formula', () => {
        cy.url().should('include', '/executive-report');
        cy.contains('p', 'All benefits').click();
        cy.contains('Benefits').should('be.visible');

        // Adding new benefit
        cy.contains('button', 'Add benefit').click();

        // Scroll to the menu button and click
        cy.get('button[aria-haspopup="menu"]').eq(11).scrollIntoView().click({ force: true });

        cy.contains('[role="menuitem"]', 'Edit', { timeout: 5000 })
            .click({ force: true });

        // Fill Benefit name
        cy.contains('label', /Benefit Name/i).parent()
            .find('input')
            .clear()
            .type('Division by zero test');

        // Fill Formula
        cy.contains('label', /Formula/i).parent()
            .find('input, textarea')
            .clear()
            .type('(A*B*C)/D-E');

        // Add 5 data points
        for (let i = 0; i < 5; i++) {
            cy.get('button').contains('Add Data Point').click();
        }

        // Inputs with zero value for D (Salary) to cause division by zero
        const dataPoints = [
            { name: 'Company Revenue', value: '1,000,000', unit: '$' },
            { name: 'Revenue in Scope', value: '10', unit: '%' },
            { name: 'Number of FTEs', value: '15', unit: '#' },
            { name: 'Salary', value: '0', unit: '$' }, // This will cause division by zero
            { name: 'Benefit Factor', value: '1.5', unit: '#' }
        ];

        // Fill data points
        dataPoints.forEach((point, index) => {
            // Fill name
            cy.get('input.flex.h-9.w-full.rounded-md.border.border-input')
                .eq(4 + index * 2)
                .clear()
                .type(point.name);

            // Fill value
            cy.get('input.flex.h-9.w-full.rounded-md.border.border-input')
                .eq(5 + index * 2)
                .clear()
                .type(point.value);

            // Select unit
            selectUnit(index, point.unit);
        });
        
        // Check for division by zero error message
        // This will fail if message is not displayed (which is the expected behavior for this bug)
        cy.contains('The value cannot be zero or negative', { timeout: 10000 })
            .should('be.visible')
            .then(() => {
                cy.log('✅ Error message displayed correctly: "The value cannot be zero or negative"');
            });
    });
});
