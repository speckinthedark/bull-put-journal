// Trade Template Service for saving and loading common trade setups
class TemplateService {
    constructor() {
        this.STORAGE_KEY = 'tradeTemplates';
        this.templates = this.loadTemplates();
    }

    // Load templates from localStorage
    loadTemplates() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : this.getDefaultTemplates();
        } catch (error) {
            console.error('Error loading templates:', error);
            return this.getDefaultTemplates();
        }
    }

    // Save templates to localStorage
    saveTemplates() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.templates));
        } catch (error) {
            console.error('Error saving templates:', error);
        }
    }

    // Get default templates
    getDefaultTemplates() {
        return [
            {
                id: 'spy-30dte-25delta',
                name: 'SPY 30DTE 0.25Δ',
                description: 'Conservative SPY spread with 30 days to expiration',
                ticker: 'SPY',
                dte: 30,
                targetDelta: 0.25,
                spreadWidth: 5,
                contracts: 1,
                notes: 'Standard conservative setup for SPY'
            },
            {
                id: 'qqq-45dte-30delta',
                name: 'QQQ 45DTE 0.30Δ',
                description: 'Moderate QQQ spread with 45 days to expiration',
                ticker: 'QQQ',
                dte: 45,
                targetDelta: 0.30,
                spreadWidth: 10,
                contracts: 1,
                notes: 'Tech-focused moderate risk setup'
            },
            {
                id: 'iwm-30dte-20delta',
                name: 'IWM 30DTE 0.20Δ',
                description: 'Conservative small-cap spread',
                ticker: 'IWM',
                dte: 30,
                targetDelta: 0.20,
                spreadWidth: 5,
                contracts: 1,
                notes: 'Lower delta for higher volatility underlying'
            }
        ];
    }

    // Get all templates
    getAllTemplates() {
        return [...this.templates];
    }

    // Get template by ID
    getTemplate(id) {
        return this.templates.find(template => template.id === id);
    }

    // Create new template
    createTemplate(templateData) {
        const newTemplate = {
            id: `custom-${Date.now()}`,
            name: templateData.name,
            description: templateData.description || '',
            ticker: templateData.ticker,
            dte: templateData.dte,
            targetDelta: templateData.targetDelta,
            spreadWidth: templateData.spreadWidth,
            contracts: templateData.contracts || 1,
            notes: templateData.notes || '',
            isCustom: true,
            createdAt: new Date().toISOString()
        };

        this.templates.push(newTemplate);
        this.saveTemplates();
        return newTemplate;
    }

    // Update existing template
    updateTemplate(id, updates) {
        const index = this.templates.findIndex(template => template.id === id);
        if (index === -1) return null;

        this.templates[index] = {
            ...this.templates[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.saveTemplates();
        return this.templates[index];
    }

    // Delete template
    deleteTemplate(id) {
        const index = this.templates.findIndex(template => template.id === id);
        if (index === -1) return false;

        // Don't allow deletion of default templates
        if (!this.templates[index].isCustom) {
            return false;
        }

        this.templates.splice(index, 1);
        this.saveTemplates();
        return true;
    }

    // Apply template to trade form data
    applyTemplate(templateId, currentPrice = null) {
        const template = this.getTemplate(templateId);
        if (!template) return null;

        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + template.dte);

        const formData = {
            ticker: template.ticker,
            entryDate: new Date().toISOString().split('T')[0],
            expirationDate: expirationDate.toISOString().split('T')[0],
            contracts: template.contracts,
            notes: template.notes
        };

        // If we have current price, suggest strikes
        if (currentPrice) {
            // Approximate strike selection based on delta and current price
            // This is a rough approximation - in reality, you'd need options chain data
            const deltaMultiplier = template.targetDelta * 100; // Convert to percentage
            const strikeBuffer = currentPrice * (deltaMultiplier / 100) * 0.5; // Rough approximation
            
            const suggestedShortStrike = Math.floor((currentPrice - strikeBuffer) / 5) * 5; // Round to nearest $5
            const suggestedLongStrike = suggestedShortStrike - template.spreadWidth;

            formData.shortStrike = suggestedShortStrike;
            formData.longStrike = suggestedLongStrike;
            
            // Estimate credit based on spread width and delta
            const estimatedCredit = template.spreadWidth * template.targetDelta * 0.8; // Rough estimation
            formData.netCredit = Number(estimatedCredit.toFixed(2));
        }

        return formData;
    }

    // Create template from existing trade
    createTemplateFromTrade(trade, templateName, templateDescription) {
        const dte = this.calculateDTE(trade.entryDate, trade.expirationDate);
        
        return this.createTemplate({
            name: templateName,
            description: templateDescription,
            ticker: trade.ticker,
            dte: dte,
            targetDelta: 0.25, // Default, could be calculated if delta was stored
            spreadWidth: trade.shortStrike - trade.longStrike,
            contracts: trade.contracts,
            notes: trade.notes || `Template created from trade on ${trade.entryDate}`
        });
    }

    // Helper function to calculate DTE
    calculateDTE(entryDate, expirationDate) {
        const entry = new Date(entryDate);
        const expiration = new Date(expirationDate);
        const diffTime = expiration - entry;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}

export default TemplateService;
