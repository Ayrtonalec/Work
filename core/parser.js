var util = require('./util');

var parser = {
    convertOpList: function(operatorList) {
      var argsArray = operatorList.argsArray;
      var fnArray = operatorList.fnArray;
      var fnArrayLen = fnArray.length;
      var REVOPS = [];
      var opList = [];

      for (var op in util.OPS) {
        REVOPS[util.OPS[op]] = op;
      }

      for (var x = 0; x < fnArrayLen; x++) {
        var fnId = fnArray[x];
        opList.push({
          'fnId': fnId,
          'fn': REVOPS[fnId],
          'args': argsArray[x],
        });
      }
      return this.opListToTree(opList);
    },
    opListToTree: function(opList) {
        var opTree = [];
        var tmp = [];
        var opListLen = opList.length;
    
        for (var x = 0; x < opListLen; x++) {
          if (opList[x].fn === 'save') {
            opTree.push({ 'fnId': 92, 'fn': 'group', 'items': [], });
            tmp.push(opTree);
            opTree = opTree[opTree.length - 1].items;
            continue;
          }
    
          if (opList[x].fn === 'restore') {
            opTree = tmp.pop();
          } else {
            opTree.push(opList[x]);
          }
        }
        return opTree;
    }
};

module.exports = parser;