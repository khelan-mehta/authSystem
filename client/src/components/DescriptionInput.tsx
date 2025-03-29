const DescriptionInput = ({ description, onDescriptionChange }) => {
    return (
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={onDescriptionChange}
          placeholder="Enter product description..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px] resize-y"
        />
      </div>
    );
  };
  
  export default DescriptionInput;