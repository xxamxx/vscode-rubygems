require 'bundler'
require 'json'

# 通过 BUNDLE_GEMFILE 写入lockfile对应的Gemfile文件
# BUNDLE_GEMFILE=/Users/am/Dev/huion/huion-backends/Gemfile

Bundler::SharedHelpers.set_bundle_environment

proc_block = proc do
  def to_node_object
    h = {}
    instance_variables.each do |variable|
      val = instance_variable_get variable
      h[variable.to_s.delete_prefix('@')] = __node_serialize val
    end
    h
  end

  private

  def __node_serialize(val)
    case val
    when Array
      val.map { |n| __node_serialize(n) }
    else
      if val.respond_to?(:to_node_object)
        val.to_node_object
      elsif val.respond_to?(:to_s)
        val.to_s
        end
    end
  end
end

begin
  Gem::Requirement.class_eval(&proc_block)
  Gem::Dependency.class_eval(&proc_block)
  Gem::Specification.class_eval(&proc_block)
  Gem::StubSpecification.class_eval(&proc_block)
  Gem::StubSpecification::StubLine.class_eval(&proc_block)
  Bundler::StubSpecification.class_eval(&proc_block)
  Bundler::LazySpecification.class_eval(&proc_block)
  Bundler::RemoteSpecification.class_eval(&proc_block)

  gemfile = ARGV[0]
  lockfile = ARGV[1]
  definition = Bundler::Definition.build(gemfile, lockfile, nil)
  json = definition.specs.map(&:to_node_object)
  # puts JSON.pretty_generate(json)
  $stdout.puts JSON.generate(json)
rescue StandardError => e
  # puts e
  warn e.inspect
end
