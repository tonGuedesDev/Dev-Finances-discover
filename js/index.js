Modal = {
    button: document.querySelector('.input-group button'),
    modal: document.querySelector('.modal-overlay'),
    toogle() {
        if (this.modal.classList.contains('active')) {
            this.modal.classList.remove('active');
        }
        else {
            this.modal.classList.add('active');
        }
    }
}

const Utils = {
    formatCurrency(amount) {
        let value = amount / 100;
        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        return value;
    },
    formatAmount(amount) {
        return Number(amount * 100)
    },
    formatDate(date) {
        return date.split('-').reverse().join('/');
        
    }
}

const Storage = {
    getTransaction() {
        const transactions = JSON.parse(localStorage.getItem('devFinance:transactions'));

        return transactions || [];
    },
    saveTransaction(transactions) {
        localStorage.setItem('devFinance:transactions', JSON.stringify(transactions));
    }
}

const Transactions = {
    // Objeto com as transacoes
    transactions: Storage.getTransaction(),
    // Pegar o valor das entradas das transacoes, somar e mostrar no html
    incomes() {
        const incomes = this.transactions.filter(transaction => {
            return transaction.amount > 0;
        });
        
        let total = 0;
        const totalIncomes = incomes.filter(transaction => {
            total += Number(transaction.amount);
        });

        return total;
    },
    expenses() {
        const expenses = this.transactions.filter(transaction => {
            return transaction.amount < 0;
        });

        let total = 0;
        const totalExpenses = expenses.filter(transaction => {
            total += Number(transaction.amount);
        });

        return total
    },
    balance() {
        const balance = this.incomes() + this.expenses();
        return balance;
    },
    addTransaction(transaction) {
        this.transactions.push(transaction);
        App.reload();
    },
    removeTransaction(index) {
        this.transactions.splice(index, 1);
        App.reload();
    },
}

const Dom = {
    innerHtml(transactions, index) {
        const transaction = transactions;
        const cssClass = transaction.amount > 0 ? 'income' : 'expense';

        const html = `
                <td>${transaction.description}</td>
                <td class="${cssClass}">${Utils.formatCurrency(transactions.amount)}</td>
                <td>${transaction.date}</td>
                <td>
                <img onclick="Transactions.removeTransaction(${index})" src="./assets/minus.svg" alt="dinheiro que saiu">
                </td>
            `;

        return html;
    },
    // Cria a tr e adiciona no html
    addHtmlContent(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = this.innerHtml(transaction, index);

        const table = document.querySelector('.table tbody');
        table.appendChild(tr);
    },
    // atualiza valores de entrada, saida e total no html
    updateBalance() {
        const balance = Utils.formatCurrency(Transactions.balance());
        const totalIncomes = Utils.formatCurrency(Transactions.incomes());
        const totalExpenses = Utils.formatCurrency(Transactions.expenses());
        
        const incomesElement = document.querySelector('#entradas p');
        const expenseElement = document.querySelector('#saidas p');
        const balanceElement = document.querySelector('#total p');

        balanceElement.innerHTML = balance;
        expenseElement.innerHTML = totalExpenses;
        incomesElement.innerHTML = totalIncomes;
    },
    clearTable() {
        document.querySelector('.table tbody').innerHTML = '';
    },
}



const Form = {
    description: document.querySelector('#description'),
    amount: document.querySelector('#amount'),
    date: document.querySelector('#date'),

    // funcao principal
    submit(event) {
        event.preventDefault();
        try {
            this.validateFields();
            Transactions.addTransaction(this.formatFields());
            this.clearFields();
            this.closeModal();
        } catch (error) {
            alert(error);
            return;
        }
    },
    getValues() {
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value,
        }
    },
    validateFields() {
        const {description, amount, date} = this.getValues();

        if (description === '' || amount === '' || date === '') {
            throw new Error('Preencha todos os campos');
        }
    },
    formatFields() {
        let {description, amount, date} = this.getValues();

        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);

        return {description, amount, date};
    },
    clearFields() {
        const {description, amount, date} = this.getValues();
        
        this.description.value = '';
        this.amount.value = '';
        this.date.value = '';
    },
    closeModal() {
        const button = document.querySelector('.input-group button');

        Modal.modal.classList.remove('active');
    }
}
const App = {
    init() {
        Transactions.transactions.forEach((transaction, index) => {
            Dom.addHtmlContent(transaction, index);
        });
        Dom.updateBalance();
        Storage.saveTransaction(Transactions.transactions);
    },
    reload() {
        Dom.clearTable();
        this.init();
    }
}

App.init();