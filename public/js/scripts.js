document.addEventListener('DOMContentLoaded', function () {
    let actionCounter = 0;
    let expectedResultCounter = 0;

    const level1Select = document.getElementById('level1Id');

    // Cargar Test Suites Level 1
    fetch('/api/test-suites')
        .then(response => response.json())
        .then(data => {
            data.forEach(suite => {
                level1Select.innerHTML += `<option value="${suite.id}">${suite.name}</option>`;
            });

            level1Select.addEventListener('change', function () {
                const level1Id = this.value;

                fetch(`/api/test-suite-level-2?level_1_id=${level1Id}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        const level2Select = document.getElementById('level2Id');
                        level2Select.innerHTML = '<option value="">Select Test Suite Level 2</option>';
                        data.forEach(suite => {
                            level2Select.innerHTML += `<option value="${suite.id}">${suite.name}</option>`;
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching Test Suite Level 2:', error);
                    });
            });
        });

    // Cargar Actions Existentes
    fetch('/api/actions')
        .then(response => response.json())
        .then(data => {
            window.existingActions = data;
        });

    // Cargar Expected Results Existentes
    fetch('/api/expected-results')
        .then(response => response.json())
        .then(data => {
            window.existingExpectedResults = data;
        });

    document.getElementById('addActionBtn').addEventListener('click', function () {
        const actionsContainer = document.getElementById('actionsContainer');
        const newAction = document.createElement('div');
        newAction.classList.add('mb-3');
        const actionIndex = actionCounter;

        newAction.innerHTML = `
            <label for="action_${actionCounter}" class="form-label">Action ${actionCounter + 1} (Select Existing or Create New)</label>
            <select class="form-select mb-2" id="actionSelect_${actionCounter}">
                <option value="">Select Existing Action</option>
                ${window.existingActions.map(action => `<option value="${action.id}">${action.description}</option>`).join('')}
            </select>
            <input type="text" class="form-control" id="action_${actionCounter}" placeholder="Enter new action description">
            <input type="number" class="form-control mt-2" id="sequence_${actionCounter}" placeholder="Sequence" required>
        `;
        actionsContainer.appendChild(newAction);

        // Controlar habilitar/deshabilitar el campo de descripción basado en la selección
        document.getElementById(`actionSelect_${actionCounter}`).addEventListener('change', function () {
            const selectedValue = this.value;
            const actionInput = document.getElementById(`action_${actionIndex}`);

            if (selectedValue) {
                actionInput.value = '';  // Limpiar el input si se selecciona una acción existente
                actionInput.disabled = true;  // Deshabilitar input si se selecciona una acción existente
            } else {
                actionInput.disabled = false;  // Habilitar input si no se selecciona una acción existente
            }
        });

        actionCounter++;
    });

    document.getElementById('addExpectedResultBtn').addEventListener('click', function () {
        const expectedResultsContainer = document.getElementById('expectedResultsContainer');
        const newExpectedResult = document.createElement('div');
        newExpectedResult.classList.add('mb-3');
        newExpectedResult.innerHTML = `
            <label for="expectedResult_${expectedResultCounter}" class="form-label">Expected Result ${expectedResultCounter + 1} (Select Existing)</label>
            <select class="form-select" id="expectedResultSelect_${expectedResultCounter}">
                <option value="">Select Existing Expected Result</option>
                ${window.existingExpectedResults.map(result => `<option value="${result.id}">${result.description}</option>`).join('')}
            </select>
        `;
        expectedResultsContainer.appendChild(newExpectedResult);
        expectedResultCounter++;
    });

    document.getElementById('testCaseForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        try {
            // Validar campos principales
            if (!document.getElementById('name').value.trim() || 
                !document.getElementById('importance').value.trim() || 
                !document.getElementById('summary').value.trim() || 
                !document.getElementById('preconditions').value.trim() || 
                !document.getElementById('level2Id').value.trim()) {
                    throw new Error('All fields are required.');
            }

            const actions = [];
            const sequences = new Set();
            for (let i = 0; i < actionCounter; i++) {
                const actionSelect = document.getElementById(`actionSelect_${i}`).value;
                const actionDescription = document.getElementById(`action_${i}`).value.trim();
                const sequence = document.getElementById(`sequence_${i}`).value.trim();

                if (sequences.has(sequence)) {
                    throw new Error('Duplicate sequence detected.');
                }
                sequences.add(sequence);

                let actionId = actionSelect;

                if (!actionSelect && actionDescription) {
                    // Crear nueva acción y obtener su ID
                    const newActionResponse = await fetch('/api/actions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ description: actionDescription })
                    });

                    if (!newActionResponse.ok) {
                        throw new Error('Failed to create new action.');
                    }

                    const newActionData = await newActionResponse.json();
                    actionId = newActionData.id;
                }

                if (actionId && sequence) {
                    actions.push({ id: actionId, sequence: parseInt(sequence, 10) });
                } else {
                    throw new Error('Action fields cannot be empty.');
                }
            }

            const expectedResults = [];
            for (let i = 0; i < expectedResultCounter; i++) {
                const expectedResultId = document.getElementById(`expectedResultSelect_${i}`).value;
                if (expectedResultId) {
                    expectedResults.push({ id: expectedResultId });
                } else {
                    throw new Error('Expected result fields cannot be empty.');
                }
            }

            const testCase = {
                name: document.getElementById('name').value.trim(),
                importance: document.getElementById('importance').value.trim(),
                summary: document.getElementById('summary').value.trim(),
                preconditions: document.getElementById('preconditions').value.trim(),
                level_2_id: document.getElementById('level2Id').value.trim(),
                actions: actions,
                expected_results: expectedResults
            };

            console.log('Test Case Data:', JSON.stringify(testCase, null, 2));

            // Enviar datos al backend
            const testCaseResponse = await fetch('/api/test-cases', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testCase)
            });

            if (!testCaseResponse.ok) {
                throw new Error('Failed to create test case.');
            }

            const testCaseData = await testCaseResponse.json();
            alert('Test case created successfully!');
            document.getElementById('testCaseForm').reset();
            actionCounter = 0;
            expectedResultCounter = 0;
            document.getElementById('actionsContainer').innerHTML = '';
            document.getElementById('expectedResultsContainer').innerHTML = '';
            level1Select.disabled = false;  // Habilitar el dropdown de nuevo si es necesario para crear otro test case
        } catch (error) {
            console.error('Error:', error);
            showErrorModal(error.message);
            document.getElementById('testCaseForm').reset();
            actionCounter = 0;
            expectedResultCounter = 0;
            document.getElementById('actionsContainer').innerHTML = '';
            document.getElementById('expectedResultsContainer').innerHTML = '';
            level1Select.disabled = false;  // Habilitar el dropdown de nuevo si es necesario para crear otro test case
        }
    });

    function showErrorModal(errorMessage) {
        const errorModal = document.createElement('div');
        errorModal.classList.add('modal', 'fade');
        errorModal.tabIndex = -1;
        errorModal.setAttribute('role', 'dialog');
        errorModal.innerHTML = `
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Error</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>${errorMessage}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(errorModal);
        $(errorModal).modal('show');
    }
});
