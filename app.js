var budgetController = (function(){
    class Expense {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        };
    };

    class Income{
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        };
    };

    Expense.prototype.calcPercentage = function(totalInc){
        if (totalInc > 0) {
            this.percentage = Math.round((this.value / totalInc) * 100);
        }
        else {
            this.percentage = -1;
        }
        
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget:0,
        percentage:-1
    };

    var returnVal = function (num) {
        return num;
    }

    return {
        get data() {
            return data;
        },

        addItem: function(type, des, val){
            var newItem, ID;
            
            if (data.allItems[type].length > 0) {   
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else
                ID = 0;
        
            if (type === "inc") {
                newItem = new Income(ID, des, val);
            }
            else {
                newItem = new Expense(ID, des, val);
            }
            data.allItems[type].push(newItem);

            return newItem;
        }, 
        
        calculateBudget: function(){
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentage=Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }
        },

        getBudget:function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        calculatePercentages :function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function(){
            var allPerc;
            allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        deleteItem: function (type, id) {
            var ids, index;
            var ids = data.allItems[type].map(function (curr) {
                return curr.id;
            });
            index = ids.indexOf(id);

            if (index !== -1) {
                 data.allItems[type].splice(index, 1);
             }
        },
    };
})();

var uiController = (function() {
    var DOMStrings = {
        inputType: '.add_type',
        inputDescription: '.add_description',
        inputValue: '.add_value',
        inputBtn: '.add_btn',
        incomeContainer: '.income_list',
        expensesContainer: '.expenses_list',
        budgetLabel: '.total_value',
        incomeLabel: '.app_income-value',
        expensesLabel: '.app_expenses-value',
        percentageLabel: '.app_expenses-percentage',
        container: '.container',
        expensesPercLabel: '.item_percentage',
        dateLabel: '.app_title-month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };
    
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    return {
        get Input() {
            return {
                type: $(DOMStrings.inputType).val(),
                description: $(DOMStrings.inputDescription).val(),
                value: parseFloat($(DOMStrings.inputValue).val())
            };
        },

        get DOMStrings() {
            return DOMStrings;
        },

        addListItem: (obj, type)=>{
            var Html, newHtml, element;
            if (type === "inc") {
                element = DOMStrings.incomeContainer;
                Html='<div class="item clearfix" id="inc-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_delete"><button class="item_delete-btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === "exp") {
                element = DOMStrings.expensesContainer;
                Html='<div class="item clearfix" id="exp-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_percentage">21%</div><div class="item_delete"><button class="item_delete-btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            newHtml = Html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            $(element).append(newHtml);
        },

        clearFields: () => {
            var fields, fieldsArr;
            fields = $(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: (obj) =>{
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            $(DOMStrings.budgetLabel).text(formatNumber(obj.budget, type));
            $(DOMStrings.incomeLabel).text( formatNumber(obj.totalInc, 'inc'));
            $(DOMStrings.expensesLabel).text(formatNumber(obj.totalExp, 'exp'));

            if (obj.percentage > 0) {
                $(DOMStrings.percentageLabel).text(obj.percentage + '%');
            }
            else {
                $(DOMStrings.percentageLabel).text('---');
            }
        },

        displayPercentage: function(percentages){

            var fields = $(DOMStrings.expensesPercLabel);
            nodeListForEach(fields, function(current, index) {

                if (percentages[index] > 0) {
                    current.textContent=percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        displayMonth: function () {
            var now,months;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            $(DOMStrings.dateLabel).text(months[month] + " " + year);
        },

        changedType: function() {

            var fields = $(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue);

            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus');
            });

            $(DOMStrings.inputBtn).toggleClass('red');

        }
    };

})();

var controller = (function (budgetCtrl, UICtrl) {
    
    var setupEventListeners = function () {
        var Dom = UICtrl.DOMStrings;

        $(Dom.inputBtn).click(ctrlAddItem);
        $(document).keypress(function (event) {
            if (event.key === "Enter")
                ctrlAddItem();
        });
        $(Dom.container).click(ctrlDeleteItem);

        $(Dom.inputType).change(UICtrl.changedType);
    }

    var updateBudget = function () {
        budgetCtrl.calculateBudget();
        var budget = budgetCtrl.getBudget();
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function () {
        budgetCtrl.calculatePercentages();
        var percentages = budgetCtrl.getPercentages();
        UICtrl.displayPercentage(percentages);
        
    }
    
    var ctrlAddItem = function () {
        var input, newItem;
        input = UICtrl.Input;
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) { 
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();
            updateBudget();
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            budgetCtrl.deleteItem(type, ID);
            UICtrl.deleteListItem(itemID);
            updateBudget();
            updatePercentages();
        }
    };

    return {
        init: function () {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
      }     
    };

})(budgetController,uiController);

controller.init();