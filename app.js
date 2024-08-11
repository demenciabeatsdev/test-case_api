const express = require('express');
const app = express();
const testSuiteRoutes = require('./routes/testSuiteRoutes');
const testSuiteLevel2Routes = require('./routes/testSuiteLevel2Routes');  // Nuevo
const testCaseRoutes = require('./routes/testCaseRoutes');
const actionRoutes = require('./routes/actionRoutes');
const expectedResultRoutes = require('./routes/expectedResultRoutes');

app.use(express.json());

app.use('/api/test-suites', testSuiteRoutes);
app.use('/api/test-suites-level-2', testSuiteLevel2Routes);  // Nuevo
app.use('/api/test-cases', testCaseRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/expected-results', expectedResultRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
