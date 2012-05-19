/**
 * @fileOverview Class Test
 * @author Hedger Wang
 *
 * @link http://localhost:8888/jog/class/class_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;
var Class = require('jog/class').Class;

(new TestCase('Class Test'))
  .test('create',
  function() {
    var Foo = Class.create();
    var foo = new Foo();
    asserts.isTrue(foo instanceof Foo);
  })
  .test('create with config',
  function() {
    var Foo = Class.create(null, {
      main: function() {
        this.x++;
      },
      x : 0
    });
    var foo = new Foo();
    // asserts.equal(1, foo.x);
  })
  .test('create with super class',
  function() {
    var SuperClass = Class.create();
    var ChildClass = Class.create(SuperClass);
    var foo = new ChildClass();
    asserts.isTrue(foo instanceof SuperClass);
    asserts.isTrue(foo instanceof ChildClass);
  })
  .test('create with super class and config',
  function() {
    var SuperClass = Class.create(null, {
      main: function() {
        this.name = 'super';
        this.x++;
      },
      bar: function() {
        this.x = 0;
      },
      x: 0
    });
    var ChildClass = Class.create(SuperClass, {
      main:function() {
        this.name = 'child';
        this.x++;
      }
    });
    var foo = new ChildClass();
    asserts.equal(foo.name, 'child');
    asserts.equal(foo.x, 2);

    foo.bar();
    asserts.equal(foo.x, 0);
  })
  .test('test override',
  function() {
    var SuperClass = Class.create(null, {
      _x: 0
    });

    asserts.throws(function() {
      Class.create(SuperClass, {
        _x: 'a'
      });
    });

    asserts.throws(function() {
      Class.create(SuperClass, {
        _y: {}
      });
    });
  });